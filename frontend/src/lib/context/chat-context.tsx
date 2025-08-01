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
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(chatReducer, {
    messages: [],
    loading: false,
    error: undefined,
    currentSessionId: undefined,
  });

  // Use the chat session query hook for managing sessions
  const { createChatSession, chatSessions, isLoading } = useChatSessionQuery();

  const setCurrentSession = useCallback((sessionId: string) => {
    dispatch({ type: 'set_session', sessionId });
  }, []);

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

      // For now, simulate an AI response since we don't have a message sending API yet
      // TODO: Create a separate API endpoint for sending messages to AI
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `AI response to: "${content}"`, // This would be the actual AI response
        timestamp: Date.now(),
      };
      dispatch({ type: 'send_success', message: assistantMsg, sessionId });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      dispatch({ type: 'send_error', error: errorMessage });
    }
  }, [createChatSession, state.currentSessionId, setCurrentSession]);

  const clear = useCallback(() => dispatch({ type: 'clear' }), []);

  return (
    <ChatContext.Provider value={{ 
      ...state, 
      send, 
      clear, 
      setCurrentSession,
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
