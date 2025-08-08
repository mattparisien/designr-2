import { APIErrorResponse, CreateDesignTemplateRequest, CreateDesignTemplateResponse, GetDesignTemplateRequest, GetDesignTemplateResponse, UpdateDesignTemplateRequest, UpdateDesignTemplateResponse } from '@shared/types';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import Template from '../models/Template';
import { generateDescriptionAndTags } from '../utils/ai';

const router = express.Router();

/* ── Create a new template ───────────────────────────────────── */
router.post('/', async (req: Request<{}, CreateDesignTemplateResponse, CreateDesignTemplateRequest>, res: Response<CreateDesignTemplateResponse>) => {
  try {
    const templateData: CreateDesignTemplateRequest = req.body;
    const template = new Template(templateData);
    await template.save();

    if (!template._id) {
      throw new Error("Template ID not found. Template creation failed.");
    }

    // // Generate AI description and tags based on template content
    // try {
    //   const aiResult = await generateDescriptionAndTags(template);
    //   template.description = aiResult.description;
    //   template.tags = aiResult.tags;
    //   await template.save();
    // } catch (aiError) {
    //   // Log AI error but don't fail the creation
    //   if (process.env.NODE_ENV !== 'test') {
    //     console.error('[POST /templates] AI generation error:', aiError);
    //   }
    // }

    const responseBody: CreateDesignTemplateResponse = {
      id: template._id.toString(),
      title: template.title,
      description: template.description,
      category: template.category,
      tags: template.tags,
      thumbnailUrl: template.thumbnailUrl,
      pages: template.pages.map(page => ({
        id: page.id,
        elements: page.canvas.elements,
        canvas: page.canvas
      })),
      createdBy: template.createdBy ? template.createdBy.toString() : undefined,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
    }

    res.status(201).json(responseBody);
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('[POST /templates] Error:', error);
    }
    res.status(500).json(undefined);
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

    const docs = await Template.find(filters).sort({ createdAt: -1 });
    const templates = docs.map(doc => doc.toJSON());
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
router.get('/:id', async (req: Request<GetDesignTemplateRequest>, res: Response<GetDesignTemplateResponse | APIErrorResponse>) => {
  try {
    const doc = await Template.findById(req.params.id);
    const template = doc?.toJSON();

    if (!template?.id) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const responseBody: GetDesignTemplateResponse = {
      id: template.id,
      title: template.title,
      description: template.description,
      category: template.category,
      tags: template.tags,
      thumbnailUrl: template.thumbnailUrl,
      pages: template.pages,
      createdBy: template.createdBy ? template.createdBy.toString() : undefined,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
    }

    res.json(responseBody);
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
router.put('/:id', async (req: Request<UpdateDesignTemplateRequest, UpdateDesignTemplateResponse>, res: Response<UpdateDesignTemplateResponse | APIErrorResponse>) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'Template ID is required' });
    } else if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid template ID' });
    }

    // Strip out any client-provided description / tags (they will be AI generated)
    // Keep the rest of the updatable fields.
    const { description: _ignoredDescription, tags: _ignoredTags, ...updatePayload } = req.body as any;

    const updatedTemplate = await Template.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true, runValidators: true }
    );

    if (!updatedTemplate) {
      return res.status(404).json({ message: 'Template not found' });
    } else if (!updatedTemplate._id) {
      return res.status(500).json({ message: 'Template ID not found. Update failed.' });
    }

    // Always regenerate description & tags from full template context
    try {
      const aiResult = await generateDescriptionAndTags(updatedTemplate);
      updatedTemplate.description = aiResult.description;
      updatedTemplate.tags = aiResult.tags;
      await updatedTemplate.save();
    } catch (aiError) {
      if (process.env.NODE_ENV !== 'test') {
        console.error(`[PUT /templates/${req.params.id}] AI generation error:`, aiError);
      }
      // Fallback: ensure fields exist
      if (!updatedTemplate.description) updatedTemplate.description = '';
      if (!Array.isArray(updatedTemplate.tags)) updatedTemplate.tags = [] as any;
    }

    const responseBody: UpdateDesignTemplateResponse = {
      id: updatedTemplate._id.toString(),
      title: updatedTemplate.title,
      description: updatedTemplate.description,
      category: updatedTemplate.category,
      tags: updatedTemplate.tags,
      thumbnailUrl: updatedTemplate.thumbnailUrl,
      pages: updatedTemplate.pages,
      createdBy: updatedTemplate.createdBy ? updatedTemplate.createdBy.toString() : undefined,
      createdAt: updatedTemplate.createdAt.toISOString(),
      updatedAt: updatedTemplate.updatedAt.toISOString(),
    };
    console.log('the response body is', responseBody);

    return res.json(responseBody);
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error(`[PUT /templates/${req.params.id}] Error:`, error);
    }
    return res.status(500).json({ message: 'Failed to update template' });
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
