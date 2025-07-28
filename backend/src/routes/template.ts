import express from 'express';
import mongoose from 'mongoose';
import Template, { ITemplate, TemplateCategory } from '../models/Template';

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

    if (typeof req.query.category === 'string' && Object.values(TemplateCategory).includes(req.query.category as TemplateCategory)) {
      filters.category = req.query.category as TemplateCategory;
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

export default router;
