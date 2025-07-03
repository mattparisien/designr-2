import express, { Request, Response } from 'express';
import { Template } from '../models/Template';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get templates filtered by vibe
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { vibe, category = 'social-post' } = req.query;

    const filter: any = { isActive: true, category };
    if (vibe) {
      filter.vibe = vibe;
    }

    const templates = await Template.find(filter).sort({ createdAt: -1 });

    res.json({ templates });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get specific template
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const template = await Template.findById(id);
    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    res.json({ template });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create template (admin only - for seeding)
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, category, vibe, width, height, thumbnailUrl, templateData } = req.body;

    const template = new Template({
      name,
      category: category || 'social-post',
      vibe,
      width: width || 1080,
      height: height || 1080,
      thumbnailUrl,
      templateData
    });

    await template.save();

    res.status(201).json({
      message: 'Template created successfully',
      template
    });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
