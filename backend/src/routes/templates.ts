import express, { Request, Response } from 'express';
import { Template } from '../models/Template';

const router = express.Router();

// Get all templates with optional filtering
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { vibe, category, limit = 20 } = req.query;
    
    const filter: { isActive: boolean; vibe?: string; category?: string } = { isActive: true };
    if (vibe && vibe !== 'all') {
      filter.vibe = vibe as string;
    }
    if (category) {
      filter.category = category as string;
    }

    const templates = await Template.find(filter)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ templates });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get specific template
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
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

// Create new template (admin only in real app)
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, category, vibe, width, height, thumbnailUrl, templateData } = req.body;

    const template = new Template({
      name,
      category,
      vibe,
      width,
      height,
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
