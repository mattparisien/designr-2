import express, { Response } from 'express';
import multer from 'multer';
import { Brand } from '../models/Brand';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Create brand
router.post('/', authenticateToken, upload.single('logo'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, palettes, vibe } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // For now, we'll store a placeholder for logo URL
    // In production, you would upload to cloud storage (AWS S3, etc.)
    const logoUrl = req.file ? `/uploads/logos/${userId}_${Date.now()}.${req.file.originalname.split('.').pop()}` : undefined;

    const brand = new Brand({
      userId,
      name,
      logoUrl,
      palettes,
      vibe
    });

    await brand.save();

    res.status(201).json({
      message: 'Brand created successfully',
      brand: {
        id: brand._id,
        name: brand.name,
        logoUrl: brand.logoUrl,
        palettes: brand.palettes,
        vibe: brand.vibe
      }
    });
  } catch (error) {
    console.error('Brand creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's brands
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const brands = await Brand.find({ userId }).sort({ createdAt: -1 });

    res.json({ brands });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get specific brand
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const brand = await Brand.findOne({ _id: id, userId });
    if (!brand) {
      res.status(404).json({ error: 'Brand not found' });
      return;
    }

    res.json({ brand });
  } catch (error) {
    console.error('Get brand error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
