import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import Font from '../models/Font';

const router = express.Router();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Upload a new font (removed authentication for easier dev/testing)
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No font file provided'
      });
    }

    const { fontFamily, isPublic = false, userId } = req.body;
    
    if (!fontFamily) {
      // Delete uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Font family name is required'
      });
    }

    // Get the backend URL - use 5001 to match frontend expectations
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
    
    // Create font record in database
    const font = new Font({
      name: req.file.originalname.split('.')[0], // Remove extension from name
      originalName: req.file.originalname,
      fontFamily: fontFamily,
      fileUrl: `${backendUrl}/api/fonts/file/${req.file.filename}`, // Full backend URL
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      userId: userId && userId !== 'anonymous' ? userId : undefined, // Only set if valid ObjectId
      isPublic: isPublic === 'true' || isPublic === true,
    });

    await font.save();

    res.json({
      success: true,
      message: 'Font uploaded successfully',
      fontFamily: font.fontFamily, // Add fontFamily at top level
      font: {
        id: font._id,
        name: font.name,
        family: font.fontFamily,
        url: font.fileUrl,
        format: path.extname(font.originalName).substring(1), // Remove the dot
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

// Get user's fonts (removed authentication for easier dev/testing)
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Build query filter
    const filter: any = {};
    
    // Filter by userId if provided, or include fonts without userId (anonymous uploads)
    if (userId) {
      filter.$or = [
        { userId: userId },
        { userId: { $exists: false } },
        { isPublic: true }
      ];
    } else {
      filter.$or = [
        { userId: { $exists: false } },
        { isPublic: true }
      ];
    }
    
    const fonts = await Font.find(filter).sort({ createdAt: -1 });

    // Get the backend URL for constructing full URLs - use 5001 to match frontend expectations
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';

    res.json({
      success: true,
      fonts: fonts.map(font => {
        // Ensure the URL is a full URL (handle existing relative URLs)
        let fontUrl = font.fileUrl;
        if (fontUrl.startsWith('/uploads/')) {
          // Convert old relative URLs to full URLs
          const filename = path.basename(fontUrl);
          fontUrl = `${backendUrl}/api/fonts/file/${filename}`;
        } else if (fontUrl.startsWith('/api/fonts/file/')) {
          // Handle URLs that start with /api/fonts/file/
          fontUrl = `${backendUrl}${fontUrl}`;
        }
        
        return {
          id: font._id,
          name: font.name,
          family: font.fontFamily,
          url: fontUrl,
          format: path.extname(font.originalName).substring(1), // Remove the dot
          createdAt: font.createdAt,
        };
      })
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
