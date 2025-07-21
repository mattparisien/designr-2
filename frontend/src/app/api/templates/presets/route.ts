import { NextResponse } from 'next/server';

// GET /api/templates/presets - Get template presets
export async function GET() {
  try {
    // Since backend doesn't have presets endpoint, return default template presets
    const presets = [
      {
        id: 'social-post',
        name: 'Social Media Post',
        category: 'social',
        canvasSize: { width: 1080, height: 1080 },
        description: 'Perfect for Instagram, Facebook, and other social media platforms'
      },
      {
        id: 'story',
        name: 'Story',
        category: 'social',
        canvasSize: { width: 1080, height: 1920 },
        description: 'Vertical format for Instagram and Facebook stories'
      },
      {
        id: 'presentation',
        name: 'Presentation Slide',
        category: 'presentation',
        canvasSize: { width: 1920, height: 1080 },
        description: 'Standard presentation slide format'
      },
      {
        id: 'document',
        name: 'Document',
        category: 'print',
        canvasSize: { width: 816, height: 1056 },
        description: 'Letter size document format'
      },
      {
        id: 'banner',
        name: 'Web Banner',
        category: 'web',
        canvasSize: { width: 1200, height: 400 },
        description: 'Website banner or header image'
      }
    ];
    
    return NextResponse.json({ presets });
  } catch (error) {
    console.error('Error fetching template presets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template presets' },
      { status: 500 }
    );
  }
}
