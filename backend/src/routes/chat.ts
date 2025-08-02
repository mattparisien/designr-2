// src/routes/agent.ts

import express from 'express';
import ChatSession from '../models/ChatSession';
import Message from '../models/Message';

import { runDesignAgent } from '../agents/openai/factory';
import {
  InputGuardrailTripwireTriggered
} from '@openai/agents';
import { buildConversationHistory } from '../utils';

const router = express.Router();

/* ── SESSION CRUD ROUTES ───────────────────────────────────── */

/* Create new chat session */
router.post('/sessions', async (req, res) => {
  try {
    const { userId, title, aiModel } = req.body;
    const session = await ChatSession.create({ userId, title, aiModel });
    res.status(201).json({ ...session.toObject(), sessionId: session._id });
  } catch (err) {
    console.error('[POST /sessions] Error:', err);
    res.status(500).json({ message: 'Failed to create session' });
  }
});

/* List all sessions for a user */
router.get('/sessions', async (req, res) => {
  try {
    const { userId } = req.query;
    const sessions = await ChatSession.find({ userId }).sort({ updatedAt: -1 });
    res.json(sessions);
  } catch (err) {
    console.error('[GET /sessions] Error:', err);
    res.status(500).json({ message: 'Failed to fetch sessions' });
  }
});

/* Get one session with all messages */
router.get('/sessions/:id', async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.id).populate('messages');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    console.log('the session', session);
    res.json(session);
  } catch (err) {
    console.error('[GET /sessions/:id] Error:', err);
    res.status(500).json({ message: 'Failed to fetch session' });
  } 
});

/* Delete a session and its messages */
router.delete('/sessions/:id', async (req, res) => {
  try {
    const session = await ChatSession.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    await Message.deleteMany({ chatSessionId: session._id });
    res.json({ message: 'Session and messages deleted' });
  } catch (err) {
    console.error('[DELETE /sessions/:id] Error:', err);
    res.status(500).json({ message: 'Failed to delete session' });
  }
});

/* Optional: Simple manual message endpoint (still supported) */
router.post('/messages', async (req, res) => {
  try {
    const { chatSessionId, role, content, tokenCount } = req.body;
    const msg = await Message.create({ chatSessionId, role, content, tokenCount });
    await ChatSession.findByIdAndUpdate(chatSessionId, {
      $push: { messages: msg._id },
      $set: { updatedAt: new Date() }
    });
    res.status(201).json(msg);
  } catch (err) {
    console.error('[POST /messages] Error:', err);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

/* ── AI RESPONSES VIA DESIGN AGENT ───────────────────────────── */

/**
 * Build a chronological list of last 20 user/assistant messages,
 * formatted as simple "User: …"/"Assistant: …" strings.
 */
async function loadHistory(
  chatSessionId: string | null,
): Promise<{
  role: 'user' | 'assistant';
  content: string;
}[]> {
  if (!chatSessionId) return null;
  const session = await ChatSession.findById(chatSessionId).populate('messages');
  if (!session) return null;
  // Convert to simple lines for context
  return (session.messages as any[])
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-20)
    .map((m) => ({
      role: m.role,
      content: m.content
    }));
}

/* ------------------------ POST /ask ------------------------ */

router.post('/ask', async (req, res, next) => {
  const { chatSessionId, userId, content } = req.body;
  if (!content?.trim()) return res.status(400).json({ message: 'Content required' });

  const userMessage = await Message.create({
    chatSessionId: chatSessionId || null,
    role: 'user',
    content,
  });

  if (chatSessionId) {
    await ChatSession.findByIdAndUpdate(chatSessionId, {
      $push: { messages: userMessage._id },
      $set: { updatedAt: new Date() }
    });
  }

  const prevHistory = await loadHistory(chatSessionId);
  const input = [...prevHistory, { role: 'user', content }];
  console.log('Input for agent:', input);
  const designAgentInput = buildConversationHistory([...prevHistory, { role: 'user', content }]);


  try {
    const result = await runDesignAgent(designAgentInput);
    const assistantText: string = result.finalOutput as string;

    const assistantMessage = await Message.create({
      chatSessionId: chatSessionId || null,
      role: 'assistant',
      content: assistantText,
      tokenCount: result.usage?.total_tokens,
    });

    if (chatSessionId) {
      await ChatSession.findByIdAndUpdate(chatSessionId, {
        $push: { messages: assistantMessage._id },
        $set: { updatedAt: new Date() }
      });
    }

    res.status(200).json({
      userMessage,
      assistantMessage,
      usage: result.usage,
    });

  } catch (err: any) {
    if (err instanceof InputGuardrailTripwireTriggered) {
      // Extract the generic message from the guardrail output if available
      const genericMessage = err.state?.inputGuardrailResults?.[0]?.outputInfo?.genericMessage;
      const message = genericMessage || 'Sorry, I can only help with design-related tasks.';
      
      return res.status(200).json({
        message: message
      });
    }
    next(err);
  }
});

/* --------------------- POST /ask/stream --------------------- */

router.post('/ask/stream', async (req, res, next) => {
  const { chatSessionId, userId, content } = req.body;
  if (!content?.trim()) return res.status(400).json({ message: 'Content required' });

  // Setup streaming response (SSE style using text/plain)
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  const userMessage = await Message.create({
    chatSessionId: chatSessionId || null,
    role: 'user',
    content,
  });

  if (chatSessionId) {
    await ChatSession.findByIdAndUpdate(chatSessionId, {
      $push: { messages: userMessage._id },
      $set: { updatedAt: new Date() }
    });
  }

  const prevHistory = await loadHistory(chatSessionId);
  const input = [...prevHistory, { role: 'user', content }];
  console.log('Input for agent:', input);
  const designAgentInput = buildConversationHistory([...prevHistory, { role: 'user', content }]);


  try {
    // stream mode
    const streamRun = await runDesignAgent(designAgentInput);

    let chunkIndex = 0;
    let accumulatedContent = ''; // Track the accumulated content
    const textStream = streamRun.toTextStream({ compatibleWithNodeStreams: true });

    textStream.on('data', (buf: Buffer) => {
      const txt = buf.toString();
      accumulatedContent += txt; // Accumulate the content
      res.write(JSON.stringify({ type: 'chunk', index: ++chunkIndex, content: txt }) + '\n');
    });

    streamRun.completed.then(async () => {
      const assistantMessage = await Message.create({
        chatSessionId: chatSessionId || null,
        role: 'assistant',
        content: accumulatedContent || 'No response generated',
        tokenCount: streamRun.usage?.total_tokens,
      });

      if (chatSessionId) {
        await ChatSession.findByIdAndUpdate(chatSessionId, {
          $push: { messages: assistantMessage._id },
          $set: { updatedAt: new Date() }
        });
      }

      res.write(JSON.stringify({
        type: 'complete',
        assistantMessage,
        usage: streamRun.usage
      }) + '\n');
      res.end();

    }).catch((innerErr) => {
      console.error('[stream.run.completed] Error:', innerErr);
      res.write(JSON.stringify({ type: 'error', error: innerErr.message }) + '\n');
      res.end();
    });

  } catch (err: any) {
    if (err instanceof InputGuardrailTripwireTriggered) {
      // Extract the generic message from the guardrail output if available
      const genericMessage = err.state?.inputGuardrailResults?.[0]?.outputInfo?.genericMessage;
      const message = genericMessage || 'Only design‑related requests allowed.';
      
      // Reset headers and return standard JSON response instead of streaming
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      
      return res.end(JSON.stringify({
        message: message
      }));
    }
    next(err);
  }
});

export default router;
