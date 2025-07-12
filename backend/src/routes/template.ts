import express, { Request, Response } from 'express';
import { Template } from '../models/Template';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Helper function to generate a unique slug
const generateUniqueSlug = (name: string): string => {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  const timestamp = Date.now();
  return `${baseSlug}-${timestamp}`;
};

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

// Create template
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, category, vibe, width, height, thumbnailUrl, templateData } = req.body;

    const templateName = name || 'Untitled Template';
    const slug = generateUniqueSlug(templateName);

    const template = new Template({
      name: templateName,
      slug: slug,
      category: category || 'social-post',
      vibe: vibe || 'minimal',
      width: width || 1080,
      height: height || 1080,
      thumbnailUrl: thumbnailUrl || '',
      templateData: templateData || {
        elements: [],
        backgroundImage: null,
        backgroundColor: '#ffffff'
      }
    });

    await template.save();

    res.status(201).json({
      message: 'Template created successfully',
      template: {
        _id: template._id,
        name: template.name,
        slug: template.slug,
        category: template.category,
        vibe: template.vibe,
        width: template.width,
        height: template.height
      }
    });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update template
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, category, vibe, width, height, thumbnailUrl, templateData } = req.body;

    const template = await Template.findById(id);
    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    // Update fields if provided
    if (name !== undefined) template.name = name;
    if (category !== undefined) template.category = category;
    if (vibe !== undefined) template.vibe = vibe;
    if (width !== undefined) template.width = width;
    if (height !== undefined) template.height = height;
    if (thumbnailUrl !== undefined) template.thumbnailUrl = thumbnailUrl;
    if (templateData !== undefined) template.templateData = templateData;

    // Update slug if name changed
    if (name && name !== template.name) {
      template.slug = generateUniqueSlug(name);
    }

    await template.save();

    res.json({
      message: 'Template updated successfully',
      template: {
        _id: template._id,
        name: template.name,
        slug: template.slug,
        category: template.category,
        vibe: template.vibe,
        width: template.width,
        height: template.height,
        updatedAt: template.updatedAt
      }
    });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
