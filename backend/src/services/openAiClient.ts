import { setDefaultOpenAIKey, setTracingExportApiKey } from '@openai/agents';
setDefaultOpenAIKey(process.env.OPENAI_API_KEY);
setTracingExportApiKey(process.env.TRACING_API_KEY ?? process.env.OPENAI_API_KEY);
