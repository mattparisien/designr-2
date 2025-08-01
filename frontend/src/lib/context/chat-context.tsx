import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { useChatSessionQuery } from '@/lib/hooks/useChatSession';
import { type ChatSession } from '@/lib/types/api';

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
}

type Action =
  | { type: 'send_start'; message: ChatMessage }
  | { type: 'send_success'; message: ChatMessage; sessionId?: string }
  | { type: 'send_error'; error: string }
  | { type: 'set_session'; sessionId: string }
  | { type: 'load_messages'; messages: ChatMessage[] }
  | { type: 'stream_chunk'; content: string }
  | { type: 'stream_complete'; sessionId?: string }
  | { type: 'clear' };

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
    case 'stream_chunk':
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
        loading: true, // Keep loading during stream
      };
    case 'stream_complete':
      return {
        ...state,
        loading: false,
        currentSessionId: action.sessionId || state.currentSessionId,
      };
    case 'clear':
      return { messages: [], loading: false, error: undefined, currentSessionId: undefined };
    default:
      return state;
  }
}

interface ChatContextType extends State {
  send: (prompt: string, createNewSession?: boolean) => Promise<void>;
  clear: () => void;
  chatSessions: ChatSession[]; // Add chat sessions from the hook
  isLoading: boolean; // Add loading state from the hook
  setCurrentSession: (sessionId: string) => void; // Add method to set current session
  loadSessionMessages: (sessionId: string) => Promise<void>; // Add method to load messages
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(chatReducer, {
    messages: [],
    loading: false,
    error: undefined,
    currentSessionId: undefined,
  });

  // Use the chat session query hook for managing sessions and AI interactions
  const { createChatSession, chatSessions, isLoading, streamAI, getSessionWithMessages } = useChatSessionQuery();

  const setCurrentSession = useCallback((sessionId: string) => {
    dispatch({ type: 'set_session', sessionId });
  }, []);

  const loadSessionMessages = useCallback(async (sessionId: string) => {
    try {
      dispatch({ type: 'set_session', sessionId });
      const session = await getSessionWithMessages(sessionId);
      
      // Convert backend messages to frontend format
      const messages: ChatMessage[] = (session.messages || []).map((msg: { _id: string; role: string; content: string; createdAt: string }) => ({
        id: msg._id,
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
        timestamp: new Date(msg.createdAt).getTime(),
      }));
      
      dispatch({ type: 'load_messages', messages });
    } catch (error) {
      console.error('Failed to load session messages:', error);
      dispatch({ type: 'send_error', error: 'Failed to load messages' });
    }
  }, [getSessionWithMessages]);

  const send = useCallback(async (content: string, createNewSession?: boolean) => {
    console.log("Sending message:", content, "Create new session:", createNewSession);
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
        const session = await createChatSession({
          // userId: 'current-user', // This should come from auth context
          title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
          aiModel: 'gpt-4o'
        });

        sessionId = session.sessionId || session._id;
        console.log("Created new session with ID:", sessionId);
        setCurrentSession(sessionId);
      } else {
        console.log("Using existing session ID:", sessionId);
      }

      // Use streaming API - don't create assistant message here, let stream chunks handle it
      await streamAI({
        chatSessionId: sessionId,
        content: content,
        model: 'gpt-4o'
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
      chatSessions, 
      isLoading 
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
