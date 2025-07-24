import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { Project } from '../models/Project';

const router = express.Router();

// Function to ensure Cloudinary is configured
function ensureCloudinaryConfig() {
  if (!cloudinary.config().cloud_name) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  }
}

// Function to get Cloudinary storage (lazy initialization)
function getCloudinaryStorage() {
  ensureCloudinaryConfig();
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'design-tool-project-thumbnails',
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png'],
      transformation: [
        { width: 400, crop: 'fit', quality: 'auto', format: 'auto' }
      ]
    } as any,
  });
}

// Fallback to local storage if Cloudinary is not configured
const localThumbnailStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/thumbnails');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `project-${uniqueSuffix}.png`);
  }
});

// Dynamic multer configuration
const upload = multer({
  storage: process.env.CLOUDINARY_CLOUD_NAME ? undefined : localThumbnailStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
});

// For Cloudinary uploads
const cloudinaryUpload = process.env.CLOUDINARY_CLOUD_NAME 
  ? multer({ storage: getCloudinaryStorage() })
  : upload;

// GET /api/projects - Get all projects with optional filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 50,
      category,
      search,
      starred,
      shared,
      featured,
      popular,
      type
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter: any = { isActive: true };

    if (category) filter.category = category;
    if (type) filter.type = type;
    if (starred !== undefined) filter.starred = starred === 'true';
    if (shared !== undefined) filter.shared = shared === 'true';
    if (featured !== undefined) filter.featured = featured === 'true';
    if (popular !== undefined) filter.popular = popular === 'true';

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Project.countDocuments(filter)
    ]);

    res.json({
      projects,
      totalProjects: total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// DELETE /api/projects/bulk - Bulk delete projects
router.delete('/bulk', async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required and must not be empty' });
    }

    const result = await Project.deleteMany({ _id: { $in: ids } });

    res.json({ 
      message: `Successfully deleted ${result.deletedCount} projects`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error bulk deleting projects:', error);
    res.status(500).json({ error: 'Failed to delete projects' });
  }
});

// GET /api/projects/:id - Get project by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// POST /api/projects - Create new project
router.post('/', async (req: Request, res: Response) => {
  try {
    const projectData = req.body;
    
    const project = new Project(projectData);
    await project.save();

    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT /api/projects/:id - Update project
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// POST /api/projects/:id/thumbnail - Upload project thumbnail
router.post('/:id/thumbnail', cloudinaryUpload.single('thumbnail'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Update thumbnail URL
    const thumbnailUrl = process.env.CLOUDINARY_CLOUD_NAME 
      ? (req.file as any).path  // Cloudinary URL
      : `/uploads/thumbnails/${req.file.filename}`; // Local URL

    project.thumbnailUrl = thumbnailUrl;
    await project.save();

    res.json({ 
      message: 'Thumbnail uploaded successfully',
      thumbnailUrl: project.thumbnailUrl,
      project
    });
  } catch (error) {
    console.error('Error uploading thumbnail:', error);
    res.status(500).json({ error: 'Failed to upload thumbnail' });
  }
});

export default router;
