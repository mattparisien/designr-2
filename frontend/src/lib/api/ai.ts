import { Axios } from 'axios';
import { APIBase } from './base';
import { DEFAULT_CHAT_TITLE } from '../constants';

// Utility type for API error handling
interface APIError {
    response?: {
        data?: unknown;
    };
    message: string;
}

interface IAIAPI {
    summarize(text: string, model?: string): Promise<string>;
}


export class AIAPI extends APIBase implements IAIAPI {

    apiClient: Axios; // Assuming apiClient is an instance of Axios or similar HTTP client

    constructor(apiClient: Axios) {
        super();
        this.apiClient = apiClient;
    }


    async summarize(text: string, model?: string): Promise<string> {
        try {
            const response = await this.apiClient.post('/ai/summarize', {
                text,
                model,
                systemPrompt: `Summarize the following conversation in as few words as possible. This will act as a title for the chat. If you can't summarize the conversation or if the conversation isn't long enough to summarize, just return '${DEFAULT_CHAT_TITLE}'`,
                maxTokens: 20,
            });
            if (response.status === 200) {
                return response.data.summary || response.data; // Assuming the backend returns { summary: '...' }
            }
            throw new Error(`Unexpected response status: ${response.status}`);
        }
        catch (error: APIError) {
            if (error.response && error.response.data) {
                // If the backend returns a specific error message
                throw new Error(`API Error: ${error.response.data}`);
            }
            // Fallback to generic error message
            throw new Error(`Failed to summarize text: ${error.message}`);
        }
    }
}