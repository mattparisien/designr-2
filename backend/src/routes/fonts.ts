import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import Font from '../models/Font';

const router = express.Router();

// Configure multer for font file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/fonts');
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
  // Check file type
  const allowedTypes = ['.woff', '.woff2', '.ttf', '.otf'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only .woff, .woff2, .ttf, and .otf files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Upload a new font
router.post('/upload', authenticateToken, upload.single('font'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No font file provided'
      });
    }

    const { fontFamily, isPublic = false } = req.body;
    
    if (!fontFamily) {
      // Delete uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Font family name is required'
      });
    }

    // Create font record in database
    const font = new Font({
      name: req.file.originalname.split('.')[0], // Remove extension from name
      originalName: req.file.originalname,
      fontFamily: fontFamily,
      fileUrl: `/uploads/fonts/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      userId: req.user!.id,
      isPublic: isPublic === 'true' || isPublic === true,
    });

    await font.save();

    res.json({
      success: true,
      message: 'Font uploaded successfully',
      font: {
        id: font._id,
        name: font.name,
        fontFamily: font.fontFamily,
        fileUrl: font.fileUrl,
        fileSize: font.fileSize,
        isPublic: font.isPublic,
        createdAt: font.createdAt,
      }
    });

  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error('Font upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload font'
    });
  }
});

// Get user's fonts
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const fonts = await Font.find({
      $or: [
        { userId: req.user!.id },
        { isPublic: true }
      ]
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      fonts: fonts.map(font => ({
        id: font._id,
        name: font.name,
        fontFamily: font.fontFamily,
        fileUrl: font.fileUrl,
        fileSize: font.fileSize,
        isPublic: font.isPublic,
        isOwner: font.userId.toString() === req.user!.id,
        createdAt: font.createdAt,
      }))
    });

  } catch (error) {
    console.error('Get fonts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fonts'
    });
  }
});

// Delete a font
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const font = await Font.findOne({
      _id: req.params.id,
      userId: req.user!.id
    });

    if (!font) {
      return res.status(404).json({
        success: false,
        message: 'Font not found or unauthorized'
      });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../../uploads/fonts', path.basename(font.fileUrl));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await Font.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Font deleted successfully'
    });

  } catch (error) {
    console.error('Delete font error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete font'
    });
  }
});

// Serve font files
router.get('/file/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../uploads/fonts', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Font file not found'
      });
    }

    // Set appropriate headers for font files
    const ext = path.extname(filename).toLowerCase();
    let mimeType = 'application/octet-stream';
    
    switch (ext) {
      case '.woff':
        mimeType = 'font/woff';
        break;
      case '.woff2':
        mimeType = 'font/woff2';
        break;
      case '.ttf':
        mimeType = 'font/ttf';
        break;
      case '.otf':
        mimeType = 'font/otf';
        break;
    }

    res.set({
      'Content-Type': mimeType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
    });

    res.sendFile(filePath);

  } catch (error) {
    console.error('Serve font file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to serve font file'
    });
  }
});

export default router;
