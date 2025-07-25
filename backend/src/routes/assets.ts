import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import Asset from '../models/Asset';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage for multer
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'design-tool-assets',
    resource_type: 'auto', // Automatically detect file type
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'pdf', 'mp4', 'mov', 'avi'],
  } as any,
});

// Fallback to local storage if Cloudinary is not configured
const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/assets');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Use Cloudinary if configured, otherwise fall back to local storage
const storage = process.env.CLOUDINARY_CLOUD_NAME ? cloudinaryStorage : localStorage;

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

// Get all assets (only images and graphics for sidebar)
router.get('/', async (req, res) => {
  try {
    const { userId, folderId,
      page = 1,
      limit = 50, } = req.query;

    // Build query filter - only fetch image assets for the sidebar
    const filter: any = {
      type: 'image', // Only fetch image assets
      mimeType: {
        $in: [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/svg+xml',
          'image/webp'
        ]
      }
    };

    // Filter by userId if provided
    if (userId) {
      filter.userId = userId;
    }

    // Filter by folderId if provided
    if (folderId) {
      filter.folderId = folderId;
    }

    // Convert page and limit to numbers and apply pagination
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 50;
    const startIndex = (pageNum - 1) * limitNum;

    // Get total count for pagination metadata
    const totalItems = await Asset.countDocuments(filter);
    
    // Apply pagination to the query
    const assets = await Asset.find(filter)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(startIndex);

    res.json({
      success: true,
      assets: assets,
      count: assets.length,
      totalItems,
      totalPages: Math.ceil(totalItems / limitNum),
      currentPage: pageNum,
      hasNextPage: startIndex + assets.length < totalItems,
      hasPrevPage: pageNum > 1
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
    const asset = await Asset.findById(id);

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
router.post('/upload', upload.single('asset'), async (req: express.Request, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const { originalname, mimetype, size } = req.file;
    const userId = 'unknown'; // Remove user dependency since no auth

    // Determine asset type
    const assetType = mimetype.startsWith('image/') ? 'image' :
      mimetype.startsWith('video/') ? 'video' :
        mimetype.startsWith('audio/') ? 'audio' : 'document';

    let assetUrl: string;
    let thumbnailUrl: string | undefined;
    let cloudinaryPublicId: string | undefined;

    if (process.env.CLOUDINARY_CLOUD_NAME && (req.file as any).public_id) {
      // Cloudinary upload
      cloudinaryPublicId = (req.file as any).public_id;
      assetUrl = (req.file as any).secure_url;

      // Generate thumbnail for images using Cloudinary transformations
      if (assetType === 'image' && cloudinaryPublicId) {
        thumbnailUrl = cloudinary.url(cloudinaryPublicId, {
          width: 150,
          crop: 'fit',
          quality: 'auto',
          format: 'auto'
        });
      }
    } else {
      // Local storage
      assetUrl = `/uploads/assets/${req.file.filename}`;
      thumbnailUrl = assetType === 'image' ? assetUrl : undefined;
    }

    // Create new asset in database
    const newAsset = new Asset({
      name: req.body.name || originalname,
      originalFilename: originalname,
      type: assetType,
      url: assetUrl,
      mimeType: mimetype,
      fileSize: size,
      thumbnail: thumbnailUrl,
      cloudinaryPublicId,
      userId,
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      folderId: req.body.folderId || undefined
    });

    const savedAsset = await newAsset.save();

    res.json({
      success: true,
      message: 'Asset uploaded successfully',
      data: savedAsset
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
router.delete('/:id', async (req: express.Request, res) => {
  try {
    const { id } = req.params;
    const asset = await Asset.findById(id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        error: 'Asset not found'
      });
    }

    // Delete from Cloudinary if it was uploaded there
    if (asset.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(asset.cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }

    // Delete file from local filesystem if it's a local file
    if (asset.url.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '../../', asset.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete from database
    await Asset.findByIdAndDelete(id);

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

// DELETE /api/assets/bulk - Bulk delete assets
router.delete('/bulk', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'ids array is required and must not be empty' 
      });
    }

    // First, get all assets to handle cleanup (Cloudinary/filesystem)
    const assetsToDelete = await Asset.find({ _id: { $in: ids } });

    // Delete files from storage services
    for (const asset of assetsToDelete) {
      try {
        // Delete from Cloudinary if it was uploaded there
        if (asset.cloudinaryPublicId) {
          await cloudinary.uploader.destroy(asset.cloudinaryPublicId);
        }

        // Delete file from local filesystem if it's a local file
        if (asset.url.startsWith('/uploads/')) {
          const filePath = path.join(__dirname, '../../', asset.url);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      } catch (cleanupError) {
        console.error(`Error cleaning up asset ${asset._id}:`, cleanupError);
        // Continue with deletion even if cleanup fails
      }
    }

    // Delete from database
    const result = await Asset.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} assets`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error bulk deleting assets:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete assets' 
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
