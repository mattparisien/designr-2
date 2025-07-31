import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';

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
}

type Action =
  | { type: 'send_start'; message: ChatMessage }
  | { type: 'send_success'; message: ChatMessage }
  | { type: 'send_error'; error: string }
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
      };
    case 'send_error':
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    case 'clear':
      return { messages: [], loading: false, error: undefined };
    default:
      return state;
  }
}

interface ChatContextType extends State {
  send: (prompt: string) => Promise<void>;
  clear: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(chatReducer, {
    messages: [],
    loading: false,
    error: undefined,
  });

  const send = useCallback(async (content: string) => {
    console.log("Sending message:", content);
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    dispatch({ type: 'send_start', message: userMsg });
    try {
      const res = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: content }),
      });
      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.text,
        timestamp: Date.now(),
      };
      dispatch({ type: 'send_success', message: assistantMsg });
    } catch (error: any) {
      dispatch({ type: 'send_error', error: error.message || 'Something went wrong' });
    }
  }, []);

  const clear = useCallback(() => dispatch({ type: 'clear' }), []);

  return (
    <ChatContext.Provider value={{ ...state, send, clear }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};
