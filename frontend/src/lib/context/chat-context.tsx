import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { useChatSessionQuery } from '@/lib/hooks/useChatSession';
import { type ChatSession } from '@/lib/types/api';
import { DEFAULT_CHAT_MODEL, DEFAULT_CHAT_TITLE } from '../constants';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
};

interface State {
  messages: ChatMessage[];
  loading: boolean;
  error?: string;
  currentSessionId?: string; // Add current session ID
  // New: title of the current session (UI only)
  title?: string;
}

type Action =
  | { type: 'send_start'; message: ChatMessage }
  | { type: 'send_success'; message: ChatMessage; sessionId?: string }
  | { type: 'send_error'; error: string }
  | { type: 'set_session'; sessionId?: string }
  | { type: 'load_messages'; messages: ChatMessage[] }
  | { type: 'stream_chunk'; content: string }
  | { type: 'stream_complete'; sessionId?: string }
  | { type: 'clear' }
  // New: set the current session title
  | { type: 'set_title'; title: string };

function chatReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'send_start':
      return {
        ...state,
        messages: [...state.messages, action.message],
        loading: true,
        error: undefined,
      };
    case 'send_success':
      return {
        ...state,
        messages: [...state.messages, action.message],
        loading: false,
        currentSessionId: action.sessionId || state.currentSessionId,
      };
    case 'send_error':
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    case 'set_session':
      return {
        ...state,
        currentSessionId: action.sessionId,
      };
    case 'load_messages':
      return {
        ...state,
        messages: action.messages,
        loading: false,
        error: undefined,
      };
    case 'stream_chunk': {
      // Update the last message (assistant message) with streaming content
      const messages = [...state.messages];
      const lastMessageIndex = messages.length - 1;
      const lastMessage = messages[lastMessageIndex];

      if (lastMessage && lastMessage.role === 'assistant') {
        // Create a new message object to avoid mutation
        messages[lastMessageIndex] = {
          ...lastMessage,
          content: lastMessage.content + action.content
        };
      } else {
        // Create a new assistant message if one doesn't exist
        messages.push({
          id: crypto.randomUUID(),
          role: 'assistant',
          content: action.content,
          timestamp: Date.now(),
        });
      }

      return {
        ...state,
        messages,
        loading: false, // Stop loading when streaming starts
      };
    }
    case 'stream_complete':
      return {
        ...state,
        loading: false,
        currentSessionId: action.sessionId || state.currentSessionId,
      };
    case 'set_title':
      return {
        ...state,
        title: action.title,
      };
    case 'clear':
      return { messages: [], loading: false, error: undefined, currentSessionId: undefined, title: DEFAULT_CHAT_TITLE };
    default:
      return state;
  }
}

interface ChatContextType extends State {
  send: (prompt: string, createNewSession?: boolean) => Promise<void>;
  clear: () => void;
  chatSessions: ChatSession[]; // Add chat sessions from the hook
  isLoading: boolean; // Add loading state from the hook
  setCurrentSession: (sessionId?: string) => void; // Add method to set current session
  loadSessionMessages: (sessionId: string) => Promise<void>; // Add method to load messages
  deleteSession: (sessionId: string) => Promise<void>; // Add method to delete a session
  // New: setter for title
  setTitle: (title: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Local types for backend results
type BackendMessage = { _id: string; role: 'user' | 'assistant' | 'system'; content: string; createdAt: string };
type BackendSession = ChatSession & { messages: BackendMessage[] };

enum ModelId {
  Gpt4o = 'gpt-4o'
}

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(chatReducer, {
    messages: [],
    loading: false,
    error: undefined,
    currentSessionId: undefined,
    title: DEFAULT_CHAT_TITLE,
  });

  // Use the chat session query hook for managing sessions and AI interactions
  const {
    createChatSession,
    chatSessions: rawChatSessions,
    isLoading,
    streamAI,
    getSessionWithMessages,
    deleteChatSession,
    updateChatSession,
  } = useChatSessionQuery();

  // Persist title to backend if sessionId is available
  const setTitle = useCallback((title: string) => {
    dispatch({ type: 'set_title', title });
    if (state.currentSessionId && title && title !== state.title) {
      updateChatSession({ id: state.currentSessionId, data: { title } }).catch((err) => {
        // Optionally handle error (e.g., toast)
        console.warn('Failed to persist chat title:', err);
      });
    }
  }, [state.currentSessionId, state.title, updateChatSession]);

  const setCurrentSession = useCallback((sessionId?: string) => {
    if (sessionId) {
      dispatch({ type: 'set_session', sessionId });
    } else {
      dispatch({ type: 'set_session', sessionId: undefined });
    }
  }, []);

  const loadSessionMessages = useCallback(async (sessionId: string) => {
    try {
      dispatch({ type: 'set_session', sessionId });
      const session = (await getSessionWithMessages(sessionId)) as unknown as BackendSession;

      // Set title from backend if present
      if (session && session.title) {
        dispatch({ type: 'set_title', title: session.title });
      } else {
        dispatch({ type: 'set_title', title: DEFAULT_CHAT_TITLE });
      }

      // Convert backend messages to frontend format
      const messages: ChatMessage[] = (session?.messages || []).map((msg: BackendMessage) => ({
        id: msg._id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.createdAt).getTime(),
      }));

      dispatch({ type: 'load_messages', messages });
    } catch (error) {
      console.error('Failed to load session messages:', error);
      dispatch({ type: 'send_error', error: 'Failed to load messages' });
    }
  }, [getSessionWithMessages]);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      await deleteChatSession(sessionId);

      // If the deleted session is the current session, clear it
      if (state.currentSessionId === sessionId) {
        dispatch({ type: 'clear' });
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
      dispatch({ type: 'send_error', error: 'Failed to delete session' });
    }
  }, [deleteChatSession, state.currentSessionId]);

  const send = useCallback(async (content: string, createNewSession?: boolean) => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    dispatch({ type: 'send_start', message: userMsg });

    try {
      let sessionId = state.currentSessionId;

      // Only create a new session if explicitly requested or if no current session exists
      if (createNewSession || !state.currentSessionId) {
        type CreatedSession = Partial<ChatSession> & { _id?: string; sessionId?: string };
        const created = (await createChatSession({
          title: DEFAULT_CHAT_TITLE,
          aiModel: DEFAULT_CHAT_MODEL
        })) as unknown as CreatedSession;

        sessionId = created.sessionId || created._id || '';
        console.log("Created new session with ID:", sessionId);
        setCurrentSession(sessionId);
        // Initialize title from backend response if available
        dispatch({ type: 'set_title', title: (created && (created as Partial<ChatSession>).title) || DEFAULT_CHAT_TITLE });
      } else {
        console.log("Using existing session ID:", sessionId);
      }

      // Use streaming API - don't create assistant message here, let stream chunks handle it
      await streamAI({
        chatSessionId: sessionId,
        content: content,
        model: ModelId.Gpt4o
      }, (chunk) => {
        if (chunk.type === 'chunk' && chunk.content) {
          dispatch({ type: 'stream_chunk', content: chunk.content });
        } else if (chunk.type === 'complete') {
          // Stream is complete, stop loading
          dispatch({ type: 'stream_complete', sessionId });
        } else if (chunk.type === 'error') {
          dispatch({ type: 'send_error', error: chunk.message || 'Streaming failed' });
        }
      });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      dispatch({ type: 'send_error', error: errorMessage });
    }
  }, [createChatSession, state.currentSessionId, setCurrentSession, streamAI]);

  const clear = useCallback(() => dispatch({ type: 'clear' }), []);

  return (
    <ChatContext.Provider value={{
      ...state,
      loading: state.loading, // Remove isAskingAI since we're using streaming now
      send,
      clear,
      setCurrentSession,
      loadSessionMessages,
      deleteSession,
      chatSessions: (rawChatSessions as unknown as ChatSession[]),
      isLoading,
      setTitle,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};
