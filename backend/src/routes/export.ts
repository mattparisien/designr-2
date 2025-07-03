import express, { Response } from 'express';
import sharp from 'sharp';
import { authenticateToken, AuthRequest, requireProUser } from '../middleware/auth';
import { Telemetry } from '../models/Telemetry';

const router = express.Router();

// Auto-resize template
router.post('/resize', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { templateData, targetWidth = 1920, targetHeight = 1080 } = req.body;
    const userId = req.user?._id;

    if (!templateData) {
      res.status(400).json({ error: 'Template data is required' });
      return;
    }

    // Here you would implement the logic to resize the template
    // For now, we'll return a modified template structure
    const resizedTemplate = {
      ...templateData,
      width: targetWidth,
      height: targetHeight,
      // Adjust element positions and sizes proportionally
      elements: templateData.elements?.map((element: any) => ({
        ...element,
        width: (element.width * targetWidth) / templateData.width,
        height: (element.height * targetHeight) / templateData.height,
        x: (element.x * targetWidth) / templateData.width,
        y: (element.y * targetHeight) / templateData.height,
      }))
    };

    // Log telemetry
    if (userId) {
      await new Telemetry({
        userId,
        event: 'templateResized',
        data: { 
          originalSize: `${templateData.width}x${templateData.height}`,
          targetSize: `${targetWidth}x${targetHeight}`
        }
      }).save();
    }

    res.json({
      success: true,
      resizedTemplate
    });

  } catch (error) {
    console.error('Resize error:', error);
    res.status(500).json({ error: 'Resize failed' });
  }
});

// Export PNG with optional watermark
router.post('/png', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { templateData, includeWatermark = true } = req.body;
    const userId = req.user?._id;
    const isProUser = req.user?.isProUser;

    if (!templateData) {
      res.status(400).json({ error: 'Template data is required' });
      return;
    }

    // For demo purposes, create a simple colored rectangle
    // In production, you would render the actual template
    const width = templateData.width || 1080;
    const height = templateData.height || 1080;
    const backgroundColor = templateData.backgroundColor || '#ffffff';

    let image = sharp({
      create: {
        width,
        height,
        channels: 3,
        background: backgroundColor
      }
    });

    // Add watermark for non-pro users
    if (includeWatermark && !isProUser) {
      const watermarkText = Buffer.from(
        `<svg width="${width}" height="${height}">
          <text x="50%" y="95%" font-family="Arial" font-size="24" fill="rgba(0,0,0,0.3)" text-anchor="middle">
            Made with Design Tool - Upgrade to remove watermark
          </text>
        </svg>`
      );

      image = image.composite([{ input: watermarkText, top: 0, left: 0 }]);
    }

    const pngBuffer = await image.png().toBuffer();

    // Log telemetry
    if (userId) {
      await new Telemetry({
        userId,
        event: 'exportClicked',
        data: { 
          format: 'png',
          size: `${width}x${height}`,
          hasWatermark: includeWatermark && !isProUser
        }
      }).save();
    }

    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': 'attachment; filename="design.png"',
      'Content-Length': pngBuffer.length
    });

    res.send(pngBuffer);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

// Pro-only: Export without watermark
router.post('/png-pro', authenticateToken, requireProUser, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { templateData } = req.body;
    const userId = req.user?._id;

    const width = templateData.width || 1080;
    const height = templateData.height || 1080;
    const backgroundColor = templateData.backgroundColor || '#ffffff';

    const image = sharp({
      create: {
        width,
        height,
        channels: 3,
        background: backgroundColor
      }
    });

    const pngBuffer = await image.png().toBuffer();

    // Log telemetry
    if (userId) {
      await new Telemetry({
        userId,
        event: 'proExportClicked',
        data: { 
          format: 'png',
          size: `${width}x${height}`
        }
      }).save();
    }

    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': 'attachment; filename="design-pro.png"',
      'Content-Length': pngBuffer.length
    });

    res.send(pngBuffer);

  } catch (error) {
    console.error('Pro export error:', error);
    res.status(500).json({ error: 'Pro export failed' });
  }
});

export default router;
