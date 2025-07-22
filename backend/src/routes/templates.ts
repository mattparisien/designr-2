import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { Template } from '../models/Template';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage for template thumbnails
const thumbnailStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'design-tool-thumbnails',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [
      { width: 400, height: 300, crop: 'fill', quality: 'auto', format: 'auto' }
    ]
  } as any,
});

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
    cb(null, `thumbnail-${uniqueSuffix}.png`);
  }
});

// Use Cloudinary if configured, otherwise fall back to local storage
const storage = process.env.CLOUDINARY_CLOUD_NAME ? thumbnailStorage : localThumbnailStorage;

// Configure multer for thumbnail uploads
const uploadThumbnail = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Only allow image files for thumbnails
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for thumbnails'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for thumbnails
  }
});

// Utility function to convert base64 to buffer
function base64ToBuffer(base64String: string): Buffer {
  // Remove data URL prefix if present (data:image/png;base64,)
  const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

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

// Update template (admin only in real app)
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
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

    await template.save();

    res.json({
      message: 'Template updated successfully',
      template
    });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload thumbnail for template (accepts base64 data URL)
router.post('/:id/thumbnail', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { thumbnailData } = req.body;

    if (!thumbnailData) {
      res.status(400).json({ error: 'Thumbnail data is required' });
      return;
    }

    // Find the template
    const template = await Template.findById(id);
    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    let thumbnailUrl: string;

    if (process.env.CLOUDINARY_CLOUD_NAME) {
      // Upload to Cloudinary
      try {
        const uploadResult = await cloudinary.uploader.upload(thumbnailData, {
          folder: 'design-tool-thumbnails',
          resource_type: 'image',
          transformation: [
            { width: 400, height: 300, crop: 'fill', quality: 'auto', format: 'auto' }
          ],
          public_id: `template-${id}-${Date.now()}`
        });

        thumbnailUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        res.status(500).json({ error: 'Failed to upload thumbnail to Cloudinary' });
        return;
      }
    } else {
      // Save to local storage
      try {
        const buffer = base64ToBuffer(thumbnailData);
        const uploadPath = path.join(__dirname, '../../uploads/thumbnails');
        
        // Ensure directory exists
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }

        const filename = `template-${id}-${Date.now()}.png`;
        const filePath = path.join(uploadPath, filename);
        
        fs.writeFileSync(filePath, buffer);
        thumbnailUrl = `/uploads/thumbnails/${filename}`;
      } catch (saveError) {
        console.error('Local save error:', saveError);
        res.status(500).json({ error: 'Failed to save thumbnail locally' });
        return;
      }
    }

    // Update template with new thumbnail URL
    template.thumbnailUrl = thumbnailUrl;
    await template.save();

    res.json({
      message: 'Thumbnail uploaded successfully',
      thumbnailUrl: thumbnailUrl,
      template: {
        _id: template._id,
        name: template.name,
        thumbnailUrl: template.thumbnailUrl
      }
    });

  } catch (error) {
    console.error('Upload thumbnail error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
