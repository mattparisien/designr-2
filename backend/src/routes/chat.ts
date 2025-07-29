import express from 'express';
import ChatSession from '../models/ChatSession';
import Message from '../models/Message';

const router = express.Router();

/* ── Create a new chat session ─────────────────────── */
router.post('/sessions', async (req, res) => {
  try {
    const { userId, title, aiModel } = req.body;
    const session = await ChatSession.create({ userId, title, aiModel });
    res.status(201).json(session);
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