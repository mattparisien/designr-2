import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Mock assets data for now - replace this with a proper database model later
const mockAssets: any[] = [
  {
    _id: '1',
    name: 'Sample Image 1',
    originalFilename: 'sample1.jpg',
    type: 'image',
    url: 'https://via.placeholder.com/300x200/3b82f6/ffffff?text=Sample+1',
    mimeType: 'image/jpeg',
    fileSize: 12345,
    thumbnail: 'https://via.placeholder.com/150x100/3b82f6/ffffff?text=Sample+1',
    userId: 'mock-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '2',
    name: 'Sample Image 2',
    originalFilename: 'sample2.jpg',
    type: 'image',
    url: 'https://via.placeholder.com/300x200/10b981/ffffff?text=Sample+2',
    mimeType: 'image/jpeg',
    fileSize: 23456,
    thumbnail: 'https://via.placeholder.com/150x100/10b981/ffffff?text=Sample+2',
    userId: 'mock-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '3',
    name: 'Sample Image 3',
    originalFilename: 'sample3.jpg',
    type: 'image',
    url: 'https://via.placeholder.com/300x200/f59e0b/ffffff?text=Sample+3',
    mimeType: 'image/jpeg',
    fileSize: 34567,
    thumbnail: 'https://via.placeholder.com/150x100/f59e0b/ffffff?text=Sample+3',
    userId: 'mock-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '4',
    name: 'Sample Image 4',
    originalFilename: 'sample4.jpg',
    type: 'image',
    url: 'https://via.placeholder.com/300x200/ec4899/ffffff?text=Sample+4',
    mimeType: 'image/jpeg',
    fileSize: 45678,
    thumbnail: 'https://via.placeholder.com/150x100/ec4899/ffffff?text=Sample+4',
    userId: 'mock-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '5',
    name: 'Sample Image 5',
    originalFilename: 'sample5.jpg',
    type: 'image',
    url: 'https://via.placeholder.com/300x200/8b5cf6/ffffff?text=Sample+5',
    mimeType: 'image/jpeg',
    fileSize: 56789,
    thumbnail: 'https://via.placeholder.com/150x100/8b5cf6/ffffff?text=Sample+5',
    userId: 'mock-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Configure multer for asset file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/assets');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  // Check file type - allow various asset types
  const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.pdf', '.mp4', '.mov', '.avi'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image, video, and document files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

// Get all assets
router.get('/', async (req, res) => {
  try {
    const { userId, folderId } = req.query;
    
    let filteredAssets = mockAssets;
    
    // Filter by userId if provided
    if (userId) {
      filteredAssets = filteredAssets.filter(asset => asset.userId === userId);
    }
    
    // Filter by folderId if provided
    if (folderId) {
      // For now, we don't have folder structure in mock data
      // This would be implemented with a proper database
    }
    
    res.json({
      success: true,
      data: filteredAssets,
      count: filteredAssets.length
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assets'
    });
  }
});

// Get asset by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const asset = mockAssets.find(a => a._id === id);
    
    if (!asset) {
      return res.status(404).json({
        success: false,
        error: 'Asset not found'
      });
    }
    
    res.json({
      success: true,
      data: asset
    });
  } catch (error) {
    console.error('Error fetching asset:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch asset'
    });
  }
});

// Upload a new asset (keep authentication for upload)
router.post('/upload', authenticateToken, upload.single('asset'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const { originalname, filename, mimetype, size } = req.file;
    const userId = req.user?.id || 'unknown';
    
    // Create asset object
    const newAsset = {
      _id: Date.now().toString(),
      name: req.body.name || originalname,
      originalFilename: originalname,
      type: mimetype.startsWith('image/') ? 'image' : 
            mimetype.startsWith('video/') ? 'video' : 
            mimetype.startsWith('audio/') ? 'audio' : 'document',
      url: `/uploads/assets/${filename}`,
      mimeType: mimetype,
      fileSize: size,
      thumbnail: mimetype.startsWith('image/') ? `/uploads/assets/${filename}` : undefined,
      userId,
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      folderId: req.body.folderId || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to mock assets (in a real app, save to database)
    mockAssets.push(newAsset);

    res.json({
      success: true,
      message: 'Asset uploaded successfully',
      data: newAsset
    });
  } catch (error) {
    console.error('Error uploading asset:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload asset'
    });
  }
});

// Delete an asset (keep authentication for delete)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const assetIndex = mockAssets.findIndex(a => a._id === id);
    
    if (assetIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Asset not found'
      });
    }
    
    const asset = mockAssets[assetIndex];
    
    // Delete file from filesystem if it's a local file
    if (asset.url.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '../../', asset.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Remove from mock assets
    mockAssets.splice(assetIndex, 1);

    res.json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting asset:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete asset'
    });
  }
});

// Serve asset files
router.get('/file/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads/assets', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }
    
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving asset file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to serve file'
    });
  }
});

export default router;
