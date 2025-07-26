import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { Composition } from '../models/Composition';

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
      folder: 'design-tool-composition-thumbnails',
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
    cb(null, `composition-${uniqueSuffix}.png`);
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

// GET /api/compositions - Get all compositions with optional filtering
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
      type,
      isTemplate
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
    if (isTemplate !== undefined) filter.isTemplate = isTemplate === 'true';
    
    // Search by name or title
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // If userId is available in request (from auth middleware)
    if (req.body.userId) {
      filter.userId = req.body.userId;
    }

    const total = await Composition.countDocuments(filter);
    const compositions = await Composition.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      data: compositions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching compositions:', error);
    res.status(500).json({ error: 'Failed to fetch compositions' });
  }
});

// GET /api/compositions/:id - Get composition by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const composition = await Composition.findById(req.params.id);
    if (!composition) {
      return res.status(404).json({ error: 'Composition not found' });
    }
    res.json(composition);
  } catch (error) {
    console.error('Error fetching composition:', error);
    res.status(500).json({ error: 'Failed to fetch composition' });
  }
});

// POST /api/compositions - Create a new composition
router.post('/', async (req: Request, res: Response) => {
  try {
    // Set userId if available from auth middleware
    if (req.body.userId) {
      req.body.userId = req.body.userId;
    }
    
    const composition = new Composition(req.body);
    await composition.save();
    res.status(201).json(composition);
  } catch (error) {
    console.error('Error creating composition:', error);
    res.status(500).json({ error: 'Failed to create composition' });
  }
});

// PUT /api/compositions/:id - Update a composition
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const composition = await Composition.findById(id);
    
    if (!composition) {
      return res.status(404).json({ error: 'Composition not found' });
    }
    
    // Optional: Check ownership
    // if (req.body.userId && composition.userId && composition.userId.toString() !== req.body.userId) {
    //   return res.status(403).json({ error: 'Unauthorized to update this composition' });
    // }
    
    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== '__v') {
        (composition as any)[key] = req.body[key];
      }
    });
    
    await composition.save();
    res.json(composition);
  } catch (error) {
    console.error('Error updating composition:', error);
    res.status(500).json({ error: 'Failed to update composition' });
  }
});

// DELETE /api/compositions/:id - Delete a composition
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const composition = await Composition.findById(id);
    
    if (!composition) {
      return res.status(404).json({ error: 'Composition not found' });
    }
    
    // Optional: Check ownership
    // if (req.body.userId && composition.userId && composition.userId.toString() !== req.body.userId) {
    //   return res.status(403).json({ error: 'Unauthorized to delete this composition' });
    // }
    
    // Soft delete
    composition.isActive = false;
    await composition.save();
    
    res.json({ message: 'Composition deleted successfully' });
  } catch (error) {
    console.error('Error deleting composition:', error);
    res.status(500).json({ error: 'Failed to delete composition' });
  }
});

// POST /api/compositions/:id/thumbnail - Upload thumbnail for composition
router.post('/:id/thumbnail', cloudinaryUpload.single('thumbnail'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const composition = await Composition.findById(id);
    
    if (!composition) {
      return res.status(404).json({ error: 'Composition not found' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    let thumbnailUrl;
    
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      // Cloudinary already stored the file, get the URL from the result
      thumbnailUrl = (req.file as any).path;
    } else {
      // For local storage, construct URL
      const serverUrl = `${req.protocol}://${req.get('host')}`;
      const relativePath = req.file.path.replace(/\\/g, '/').split('uploads/')[1];
      thumbnailUrl = `${serverUrl}/uploads/${relativePath}`;
    }
    
    composition.thumbnailUrl = thumbnailUrl;
    await composition.save();
    
    res.json({ thumbnailUrl });
  } catch (error) {
    console.error('Error uploading thumbnail:', error);
    res.status(500).json({ error: 'Failed to upload thumbnail' });
  }
});

// GET /api/compositions/templates - Get templates only
router.get('/templates', async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 50,
      category,
      search,
      featured,
      popular,
      type
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Only get templates
    const filter: any = { isActive: true, isTemplate: true };

    if (category) filter.category = category;
    if (type) filter.type = type;
    if (featured !== undefined) filter.featured = featured === 'true';
    if (popular !== undefined) filter.popular = popular === 'true';
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Composition.countDocuments(filter);
    const templates = await Composition.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      data: templates,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// GET /api/compositions/projects - Get projects only
router.get('/projects', async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 50,
      category,
      search,
      starred,
      shared,
      type
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Only get projects
    const filter: any = { isActive: true, isTemplate: false };

    if (category) filter.category = category;
    if (type) filter.type = type;
    if (starred !== undefined) filter.starred = starred === 'true';
    if (shared !== undefined) filter.shared = shared === 'true';
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // If userId is available in request (from auth middleware)
    if (req.body.userId) {
      filter.userId = req.body.userId;
    }

    const total = await Composition.countDocuments(filter);
    const projects = await Composition.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      data: projects,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// DELETE /api/compositions/batch - Batch delete compositions
router.delete('/batch', async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No IDs provided for deletion' });
    }
    
    // Soft delete all compositions in the array
    await Composition.updateMany(
      { _id: { $in: ids } },
      { $set: { isActive: false } }
    );
    
    res.json({ message: `${ids.length} compositions deleted successfully` });
  } catch (error) {
    console.error('Error batch deleting compositions:', error);
    res.status(500).json({ error: 'Failed to delete compositions' });
  }
});

export default router;
