import express from 'express';
import Project from '../models/Project';

const router = express.Router();

/* ── Create a new project ───────────────────────────── */
router.post('/', async (req, res) => {
  try {
    const projectData = req.body;
    const project = new Project(projectData);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.error('[POST /projects] Error:', error);
    res.status(500).json({ message: 'Failed to create project', error });
  }
});

/* ── Get all projects for a user (optional filter) ──── */
router.get('/', async (req, res) => {
  try {
    const { ownerId, templateId } = req.query;
    const filters: any = {};

    if (ownerId) filters.ownerId = ownerId;
    if (templateId) filters.templateId = templateId;

    const projects = await Project.find(filters).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    console.error('[GET /projects] Error:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

/* ── Get a single project by ID ─────────────────────── */
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    console.error(`[GET /projects/${req.params.id}] Error:`, error);
    res.status(500).json({ message: 'Failed to fetch project' });
  }
});

/* ── Update a project ───────────────────────────────── */
router.put('/:id', async (req, res) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedProject) return res.status(404).json({ message: 'Project not found' });
    res.json(updatedProject);
  } catch (error) {
    console.error(`[PUT /projects/${req.params.id}] Error:`, error);
    res.status(500).json({ message: 'Failed to update project' });
  }
});

/* ── Delete a project ───────────────────────────────── */
router.delete('/:id', async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    if (!deletedProject) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    console.error(`[DELETE /projects/${req.params.id}] Error:`, error);
    res.status(500).json({ message: 'Failed to delete project' });
  }
});

export default router;