import express, { Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { Brand } from '../models/Brand';
import { Telemetry } from '../models/Telemetry';

const router = express.Router();

// Get user's brands
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    const brands = await Brand.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      brands
    });

  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

/* ── Get paginated brands ─────────────────────────────────── */
router.get('/paginated', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const filters: any = {};
  
    if (typeof req.query.isPublic === 'string') {
      filters.isPublic = req.query.isPublic === 'true';
    }

    const skip = (page - 1) * limit;

    const [brands, totalBrands] = await Promise.all([
      Brand.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Brand.countDocuments()
    ]);

    const totalPages = Math.ceil(totalBrands / limit);

    res.json({
      brands,
      totalBrands,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('[GET /templates/paginated] Error:', error);
    }
    res.status(500).json({ message: 'Failed to fetch paginated templates' });
  }
});

// Get a specific brand
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const brandId = req.params.id;

    const brand = await Brand.findOne({ _id: brandId, userId });

    if (!brand) {
      res.status(404).json({ error: 'Brand not found' });
      return;
    }

    res.json({
      success: true,
      brand
    });

  } catch (error) {
    console.error('Get brand error:', error);
    res.status(500).json({ error: 'Failed to fetch brand' });
  }
});

// Create a new brand
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {

    const userId = req.user?._id;
    const {
      name,
      logoUrl,
      primaryColor,
      secondaryColor,
      accentColor,
      vibe,
      voice,
      personality,
      targetAudience,
      toneGuidelines,
      keyValues,
      communicationStyle,
      industry,
      tagline,
      doNotUse,
      preferredWords,
      avoidedWords
    } = req.body;

    // Validation
    if (!name || !primaryColor || !secondaryColor || !vibe) {
      res.status(400).json({ error: 'Name, primary color, secondary color, and vibe are required' });
      return;
    }

    const brand = new Brand({
      userId,
      name,
      logoUrl,
      primaryColor,
      secondaryColor,
      accentColor,
      vibe,
      voice: voice || 'Professional and engaging',
      personality: personality || 'Friendly and approachable',
      targetAudience: targetAudience || 'General audience',
      toneGuidelines: toneGuidelines || 'Use clear, concise language that resonates with the audience',
      keyValues: keyValues || 'Quality, innovation, customer satisfaction',
      communicationStyle: communicationStyle || 'Direct and informative',
      industry,
      tagline,
      doNotUse,
      preferredWords: preferredWords || [],
      avoidedWords: avoidedWords || []
    });

    await brand.save();

    // Log telemetry
    await new Telemetry({
      userId,
      event: 'brandCreated',
      data: { brandId: brand._id, vibe }
    }).save();

    res.status(201).json({
      success: true,
      brand
    });

  } catch (error) {
    console.error('Create brand error:', error);
    res.status(500).json({ error: 'Failed to create brand' });
  }
});

// Update a brand
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const brandId = req.params.id;
    const updateData = req.body;

    // Remove userId from update data to prevent tampering
    delete updateData.userId;

    const brand = await Brand.findOneAndUpdate(
      { _id: brandId, userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!brand) {
      res.status(404).json({ error: 'Brand not found' });
      return;
    }

    // Log telemetry
    await new Telemetry({
      userId,
      event: 'brandUpdated',
      data: { brandId: brand._id }
    }).save();

    res.json({
      success: true,
      brand
    });

  } catch (error) {
    console.error('Update brand error:', error);
    res.status(500).json({ error: 'Failed to update brand' });
  }
});

// Delete a brand
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const brandId = req.params.id;

    const brand = await Brand.findOneAndDelete({ _id: brandId, userId });

    if (!brand) {
      res.status(404).json({ error: 'Brand not found' });
      return;
    }

    // Log telemetry
    await new Telemetry({
      userId,
      event: 'brandDeleted',
      data: { brandId }
    }).save();

    res.json({
      success: true,
      message: 'Brand deleted successfully'
    });

  } catch (error) {
    console.error('Delete brand error:', error);
    res.status(500).json({ error: 'Failed to delete brand' });
  }
});

export default router;
