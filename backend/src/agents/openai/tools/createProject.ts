import { tool } from '@openai/agents';

const BASE_API = (process.env.BACKEND_API_URL?.replace(/\/$/, '') || 'http://localhost:5001/api');

export const createProjectTool = tool({
    name: 'create_project',
    description: 'Creates a new design project. Call this when the user asks to start/make/create a (design) project/document/file/presentation/social post.',
    parameters: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'description', 'templateId'],
        properties: {
            title: { type: 'string', minLength: 1, description: 'Project title' },
            description: { type: 'string', description: 'Optional project description' },
            templateId: { type: 'string', description: 'If based on an existing template, its id' },
            pages: {
                type: 'array',
                description: 'Optional initial pages. Normally omit to let backend initialize or keep empty.',
                items: {
                    type: 'object',
                    additionalProperties: false
                }
            },
        }
    } as const,
    async execute(input: any) {
        const { title, description, templateId, pages } = input || {};

        const payload: Record<string, unknown> = { title };
        if (description) payload.description = description;
        if (templateId) payload.templateId = templateId;
        if (Array.isArray(pages) && pages.length) payload.pages = pages;

        const url = `${BASE_API}/projects`;
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const text = await res.text();
            let data: any = null;
            try { data = text ? JSON.parse(text) : null; } catch { }

            if (!res.ok) {
                return { success: false, status: res.status, error: data?.error || data || text || 'request_failed' };
            }

            return data ?? { success: true };
        } catch (err: any) {
            return { success: false, error: 'network_error', message: err?.message };
        }
    }
});
