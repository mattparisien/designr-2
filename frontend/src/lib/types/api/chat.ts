// For frontend, API contracts, or shared validation

export type ChatRole = 'user' | 'assistant' | 'system';

export interface Message {
    _id: string;
    chatSessionId: string;
    role: ChatRole;
    content: string;
    tokenCount?: number;
    createdAt: string;
}

export interface ChatSession {
    _id: string;
    userId: string;
    title: string;
    aiModel: string;
    messages?: Message[]; // optional unless populated
    createdAt: string;
    updatedAt: string;
}


export interface CreateChatSessionPayload {
    userId: string;
    title?: string;
    aiModel?: string; // e.g. "gpt-4", "gpt-4o"
}

export interface SendMessagePayload {
    chatSessionId: string;
    role: ChatRole;
    content: string;
    tokenCount?: number;
}
