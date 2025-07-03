import express, { Request, Response } from 'express';
import { Telemetry } from '../models/Telemetry';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Track telemetry event
router.post('/track', async (req: Request, res: Response): Promise<void> => {
  try {
    const { event, data, sessionId } = req.body;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Extract userId from auth if present
    let userId;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      try {
        // We could decode the token here to get userId, but keeping it simple
        // In a real app, you might want to verify the token
      } catch {
        // Invalid token, continue without userId
      }
    }

    const telemetryEntry = new Telemetry({
      userId,
      event,
      data: data || {},
      sessionId,
      userAgent,
      ipAddress
    });

    await telemetryEntry.save();

    res.json({ success: true, message: 'Event tracked' });

  } catch (error) {
    console.error('Telemetry tracking error:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

// Get telemetry for authenticated user
router.get('/user', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { limit = 100, event } = req.query;

    const filter: { userId: any, event?: string } = { userId };
    if (event && typeof event === 'string') {
      filter.event = event;
    }

    const telemetryData = await Telemetry.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({ telemetry: telemetryData });

  } catch (error) {
    console.error('Get telemetry error:', error);
    res.status(500).json({ error: 'Failed to get telemetry data' });
  }
});

// Get telemetry analytics (admin only in real app)
router.get('/analytics', async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, event } = req.query;

    const filter: any = {};
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    if (event) {
      filter.event = event;
    }

    const analytics = await Telemetry.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$event',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          event: '$_id',
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({ analytics });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics data' });
  }
});

export default router;
