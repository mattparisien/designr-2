/**
 * Template Thumbnail Upload System
 * 
 * This system automatically captures and uploads template thumbnails when saving in the editor.
 * 
 * Flow:
 * 1. User saves template in editor (Cmd+S or via UI)
 * 2. System captures canvas screenshot as base64 PNG data URL
 * 3. Frontend uploads base64 data to backend API endpoint
 * 4. Backend converts base64 to image file and saves it:
 *    - If Cloudinary is configured: uploads to cloud storage with optimizations
 *    - If no Cloudinary: saves to local /uploads/thumbnails/ directory
 * 5. Backend updates template record with new thumbnailUrl
 * 6. Thumbnail appears in template listings and gallery views
 * 
 * Key Components:
 * - Frontend: useEditorStore.saveTemplate() captures and uploads thumbnails
 * - API Route: /api/templates/[id]/thumbnail proxies to backend
 * - Backend Route: POST /templates/:id/thumbnail handles file storage
 * - Storage: Cloudinary (cloud) or local filesystem fallback
 * 
 * Configuration:
 * - Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in backend .env for cloud storage
 * - Leave empty for local storage fallback
 * 
 * File Formats:
 * - Source: Base64 PNG data URL from canvas
 * - Storage: PNG format, optimized at 400x300px
 * - Quality: Auto-optimized for web delivery
 */

// Test function to verify thumbnail upload (for development)
export async function testThumbnailUpload(templateId: string) {
  console.log('Testing thumbnail upload for template:', templateId);
  
  // Create a simple test image as base64
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Draw a simple test pattern
    ctx.fillStyle = '#3498db';
    ctx.fillRect(0, 0, 400, 300);
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Test Thumbnail', 200, 150);
    
    const thumbnailData = canvas.toDataURL('image/png');
    
    try {
      const response = await fetch(`/api/templates/${templateId}/thumbnail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          thumbnailData
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Thumbnail upload test successful:', result);
        return result;
      } else {
        console.error('❌ Thumbnail upload test failed:', response.status);
      }
    } catch (error) {
      console.error('❌ Thumbnail upload test error:', error);
    }
  }
}

// Test function to capture actual canvas screenshot
export async function testCanvasScreenshot() {
  console.log('Testing canvas screenshot capture...');
  
  // Import useEditorStore to access the capture function
  try {
    const useEditorStore = (await import('@/app/(routes)/[id]/lib/stores/useEditorStore')).default;
    const captureFunction = useEditorStore.getState().captureCanvasScreenshot;
    
    const result = await captureFunction();
    
    if (result) {
      console.log('✅ Canvas screenshot captured successfully!');
      console.log('Data URL length:', result.length);
      console.log('Preview:', result.substring(0, 100) + '...');
      
      // You can copy this data URL and paste it in browser address bar to see the image
      console.log('📋 Copy this data URL to see the captured image:');
      console.log(result);
      return result;
    } else {
      console.error('❌ Canvas screenshot capture failed');
    }
  } catch (error) {
    console.error('❌ Canvas screenshot test error:', error);
  }
}

// Usage in browser console:
// testThumbnailUpload('your-template-id-here')
