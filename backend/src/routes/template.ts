import express from 'express';
import mongoose from 'mongoose';
import Template, { TemplateCategory } from '../models/Template';

const router = express.Router();

/* ── Create a new template ───────────────────────────────────── */
router.post('/', async (req, res) => {
  try {
    const templateData = req.body;
    const template = new Template(templateData);
    await template.save();
    res.status(201).json(template);
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('[POST /templates] Error:', error);
    }
    res.status(500).json({ message: 'Failed to create template', error });
  }
});

/* ── Get all templates (with optional filters) ───────────────── */
router.get('/', async (req, res) => {
  try {
    const filters: any = {};
    const validCategories = ['presentation', 'social', 'print', 'custom'];

    if (typeof req.query.category === 'string' && validCategories.includes(req.query.category)) {
      filters.category = req.query.category;
    }

    if (typeof req.query.isPublic === 'string') {
      filters.isPublic = req.query.isPublic === 'true';
    }

    const templates = await Template.find(filters).sort({ createdAt: -1 });
    res.json(templates);
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('[GET /templates] Error:', error);
    }
    res.status(500).json({ message: 'Failed to fetch templates' });
  }
});

/* ── Get paginated templates ─────────────────────────────────── */
router.get('/paginated', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const filters: any = {};
    const validCategories = ['presentation', 'social', 'print', 'custom'];
    if (typeof req.query.category === 'string' && validCategories.includes(req.query.category)) {
      filters.category = req.query.category;
    }
    if (typeof req.query.isPublic === 'string') {
      filters.isPublic = req.query.isPublic === 'true';
    }

    const skip = (page - 1) * limit;
    
    const [templates, totalTemplates] = await Promise.all([
      Template.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Template.countDocuments(filters)
    ]);

    const totalPages = Math.ceil(totalTemplates / limit);

    res.json({
      templates,
      totalTemplates,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('[GET /templates/paginated] Error:', error);
    }
    res.status(500).json({ message: 'Failed to fetch paginated templates' });
  }
});

/* ── Get a single template by ID ─────────────────────────────── */
router.get('/:id', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error(`[GET /templates/${req.params.id}] Error:`, error);
    }
    res.status(500).json({ message: 'Failed to fetch template' });
  }
});

/* ── Delete multiple templates (bulk) ─────────────────────────── */
router.delete('/bulk', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty ids array' });
    }

    const result = await Template.deleteMany({ _id: { $in: ids } });
    res.json({ 
      message: `${result.deletedCount} templates deleted`,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('[DELETE /templates/bulk] Error:', error);
    }
    res.status(500).json({ message: 'Failed to delete templates' });
  }
});

/* ── Update a template ───────────────────────────────────────── */
router.put('/:id', async (req, res) => {
  try {
    const updatedTemplate = await Template.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedTemplate) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json(updatedTemplate);
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error(`[PUT /templates/${req.params.id}] Error:`, error);
    }
    res.status(500).json({ message: 'Failed to update template' });
  }
});

/* ── Delete a template ───────────────────────────────────────── */
router.delete('/:id', async (req, res) => {
  try {
    const deletedTemplate = await Template.findByIdAndDelete(req.params.id);
    if (!deletedTemplate) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json({ message: 'Template deleted' });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error(`[DELETE /templates/${req.params.id}] Error:`, error);
    }
    res.status(500).json({ message: 'Failed to delete template' });
  }
});

/* ── Delete multiple templates ───────────────────────────────── */
router.post('/delete-multiple', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty ids array' });
    }

    const result = await Template.deleteMany({ _id: { $in: ids } });
    res.json({ 
      message: `${result.deletedCount} templates deleted`,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('[POST /templates/delete-multiple] Error:', error);
    }
    res.status(500).json({ message: 'Failed to delete templates' });
  }
});

export default router;
