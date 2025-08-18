import express, { Response } from 'express';
import sharp from 'sharp';
import { authenticateToken, AuthRequest, requireProUser } from '../middleware/auth';
import { toNumber, escapeHtml } from '../utils';

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
router.post('/png', async (req, res: Response): Promise<void> => {
  try {
    const { templateData, includeWatermark = false } = req.body;
    if (!templateData) {
      res.status(400).json({ error: 'Template data is required' });
      return;
    }

    // Canvas dims ---------------------------------------------------
    const width  = toNumber(templateData.width, 1080);
    const height = toNumber(templateData.height, 1080);
    const backgroundColor = templateData.backgroundColor ?? '#ffffff';

    let image = sharp({
      create: {
        width,
        height,
        channels: 4,          // RGBA
        background: backgroundColor
      }
    });

    // Build overlays ------------------------------------------------
    const overlays: sharp.OverlayOptions[] = [];

    (templateData.elements ?? [])
      .slice() // don't mutate caller's array
      .sort((a: any, b: any) => toNumber(a.zIndex) - toNumber(b.zIndex)) // bottom→top
      .forEach((el: any) => {
        const x = Math.max(0, Math.round(toNumber(el.x)));
        const y = Math.max(0, Math.round(toNumber(el.y)));
        const w = Math.min(toNumber(el.width, 200),  width  - x);
        const h = Math.min(toNumber(el.height, 50),  height - y);
        if (w <= 0 || h <= 0) return; // off-canvas

        if (el.type === 'text' && el.content) {
          const fontSize = Math.min(toNumber(el.style?.fontSize, 16), 20);
          const fontFamily = el.style?.fontFamily ?? 'Arial, sans-serif';
          const fontWeight = el.style?.fontWeight ?? 'normal';
          const fill = el.style?.color ?? '#000';

          const svg = `
            <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
              <text x="50%" y="50%"
                    text-anchor="middle" alignment-baseline="middle"
                    font-family="${fontFamily}"
                    font-size="${fontSize}"
                    font-weight="${fontWeight}"
                    fill="${fill}">
                ${escapeHtml(el.content)}
              </text>
            </svg>`;

          overlays.push({ input: Buffer.from(svg), left: x, top: y });
        }

        else if (el.type === 'shape') {
          const fill = el.style?.backgroundColor ?? '#3b82f6';
          let svg: string;

          if (el.shapeType === 'circle') {
            const r = Math.min(w, h) / 2;
            svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
                     <circle cx="${w/2}" cy="${h/2}" r="${r}" fill="${fill}" />
                   </svg>`;
          } else if (el.shapeType === 'triangle') {
            svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
                     <polygon points="${w/2},0 0,${h} ${w},${h}" fill="${fill}" />
                   </svg>`;
          } else {
            svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
                     <rect width="${w}" height="${h}" fill="${fill}" />
                   </svg>`;
          }

          overlays.push({ input: Buffer.from(svg), left: x, top: y });
        }

        else if (el.type === 'line') {
          const stroke = el.style?.backgroundColor ?? '#000';
          const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
                         <rect width="${w}" height="${h}" fill="${stroke}" />
                       </svg>`;
          overlays.push({ input: Buffer.from(svg), left: x, top: y });
        }
      });

    if (overlays.length) {
      image = image.composite(overlays);
    }

    // optional watermark -------------------------------------------
    if (includeWatermark) {
      const watermarkSvg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <text x="50%" y="95%"
                text-anchor="middle"
                font-family="Arial"
                font-size="24"
                fill="rgba(0,0,0,0.3)">
            Made with Design Tool
          </text>
        </svg>`;
      image = image.composite([{ input: Buffer.from(watermarkSvg), top: 0, left: 0 }]);
    }

    const pngBuffer = await image.png().toBuffer();

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


// Development-only PNG export without authentication (remove in production)
router.post('/png-dev', async (req, res: Response): Promise<void> => {
  try {
    const { templateData, includeWatermark = false } = req.body;

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

    // Add development watermark if requested
    if (includeWatermark) {
      const watermarkText = Buffer.from(
        `<svg width="${width}" height="${height}">
          <text x="50%" y="95%" font-family="Arial" font-size="24" fill="rgba(0,0,0,0.3)" text-anchor="middle">
            Development Export
          </text>
        </svg>`
      );

      image = image.composite([{ input: watermarkText, top: 0, left: 0 }]);
    }

    const pngBuffer = await image.png().toBuffer();

    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': 'attachment; filename="design-dev.png"',
      'Content-Length': pngBuffer.length
    });

    res.send(pngBuffer);

  } catch (error) {
    console.error('Dev export error:', error);
    res.status(500).json({ error: 'Dev export failed' });
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
