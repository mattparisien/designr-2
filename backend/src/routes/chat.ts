import express from 'express';
import ChatSession from '../models/ChatSession';
import Message from '../models/Message';
import { generateSimpleResponse, generateAIResponse, type ChatMessage as AIChatMessage } from '../services/aiService';

const router = express.Router();

/* ── Create a new chat session ─────────────────────── */
router.post('/sessions', async (req, res) => {
  try {
    const { userId, title, aiModel } = req.body;
    const session = await ChatSession.create({ userId, title, aiModel });
    
    // Return the session with explicit sessionId field
    const response = {
      ...session.toObject(),
      sessionId: session._id,
    };
    
    res.status(201).json(response);
  } catch (err) {
    console.error('[POST /sessions] Error:', err);
    res.status(500).json({ message: 'Failed to create session' });
  }
});

/* ── Get all chat sessions for a user ──────────────── */
router.get('/sessions', async (req, res) => {
  try {
    const { userId } = req.query;
    const sessions = await ChatSession.find({ userId }).sort({ updatedAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sessions' });
  }
});

/* ── Get a single session and its messages ─────────── */
router.get('/sessions/:id', async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.id).populate('messages');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch session' });
  }
});

/* ── Post a message to a session ───────────────────── */
router.post('/messages', async (req, res) => {
  try {
    const { chatSessionId, role, content, tokenCount } = req.body;
    const message = await Message.create({ chatSessionId, role, content, tokenCount });
    await ChatSession.findByIdAndUpdate(chatSessionId, {
      $push: { messages: message._id },
      $set: { updatedAt: new Date() }
    });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message' });
  }
});

/* ── Ask AI for a response (with session context) ─── */
router.post('/ask', async (req, res) => {
  try {
    const { chatSessionId, content, model = 'gpt-4o' } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    // Save user message first
    const userMessage = await Message.create({
      chatSessionId: chatSessionId || null,
      role: 'user',
      content,
    });

    let aiResponse;
    
    if (chatSessionId) {
      // If we have a session, get the conversation history
      const session = await ChatSession.findById(chatSessionId).populate('messages');
      if (!session) {
        return res.status(404).json({ message: 'Chat session not found' });
      }

      // Build conversation history for context
      const conversationHistory: AIChatMessage[] = [
        {
          role: 'system',
          content: 'You are a helpful AI assistant. Provide clear, concise, and helpful responses based on the conversation history.'
        }
      ];

      // Add existing messages to history (limit to last 20 for context)
      const messages = session.messages.slice(-20) as any[];
      messages.forEach((msg: any) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          conversationHistory.push({
            role: msg.role,
            content: msg.content
          });
        }
      });

      // Add the new user message
      conversationHistory.push({
        role: 'user',
        content
      });

      // Generate AI response with full context
      aiResponse = await generateAIResponse(conversationHistory, model);

      // Update session with user message
      await ChatSession.findByIdAndUpdate(chatSessionId, {
        $push: { messages: userMessage._id },
        $set: { updatedAt: new Date() }
      });
    } else {
      // No session context, generate simple response
      aiResponse = await generateSimpleResponse(content, model);
    }

    // Save AI response
    const assistantMessage = await Message.create({
      chatSessionId: chatSessionId || null,
      role: 'assistant',
      content: aiResponse.content,
      tokenCount: aiResponse.usage?.total_tokens
    });

    if (chatSessionId) {
      // Update session with AI message
      await ChatSession.findByIdAndUpdate(chatSessionId, {
        $push: { messages: assistantMessage._id },
        $set: { updatedAt: new Date() }
      });
    }

    res.status(200).json({
      userMessage,
      assistantMessage,
      usage: aiResponse.usage
    });

  } catch (error: any) {
    console.error('[POST /ask] Error:', error);
    res.status(500).json({ 
      message: 'Failed to generate AI response',
      error: error.message 
    });
  }
});

/* ── Delete a chat session ─────────────────────────── */
router.delete('/sessions/:id', async (req, res) => {
  try {
    const session = await ChatSession.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    await Message.deleteMany({ chatSessionId: session._id });
    res.json({ message: 'Session and messages deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete session' });
  }
});

export default router;