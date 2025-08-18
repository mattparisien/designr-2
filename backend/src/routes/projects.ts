import express from 'express';
import Project from '../models/Project';

const router = express.Router();

/* ── Create a new project ───────────────────────────── */
router.post('/', async (req, res) => {
  try {
    const projectData = req.body;
    const project = new Project(projectData);
    await project.save();
    res.status(201).json(project.toJSON());
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

/* ── Get paginated projects ─────────────────────────── */
router.get('/paginated', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { ownerId, templateId } = req.query;
    
    const filters: any = {};
    if (ownerId) filters.ownerId = ownerId;
    if (templateId) filters.templateId = templateId;

    const skip = (page - 1) * limit;
    
    const [projects, totalProjects] = await Promise.all([
      Project.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Project.countDocuments(filters)
    ]);

    const totalPages = Math.ceil(totalProjects / limit);

    res.json({
      projects,
      totalProjects,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error('[GET /projects/paginated] Error:', error);
    res.status(500).json({ message: 'Failed to fetch paginated projects' });
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

/* ── Delete multiple projects (bulk) ─────────────────── */
router.delete('/bulk', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty ids array' });
    }

    const result = await Project.deleteMany({ _id: { $in: ids } });
    res.json({ 
      message: `${result.deletedCount} projects deleted`,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('[DELETE /projects/bulk] Error:', error);
    res.status(500).json({ message: 'Failed to delete projects' });
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

/* ── Delete multiple projects ───────────────────────── */
router.post('/delete-multiple', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty ids array' });
    }

    const result = await Project.deleteMany({ _id: { $in: ids } });
    res.json({ 
      message: `${result.deletedCount} projects deleted`,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('[POST /projects/delete-multiple] Error:', error);
    res.status(500).json({ message: 'Failed to delete projects' });
  }
});

export default router;