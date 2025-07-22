import { NextRequest, NextResponse } from 'next/server';
import puppeteer, { Browser } from 'puppeteer';

interface ScreenshotRequest {
  html: string;
  css: string;
  canvasStyles: Record<string, string>;
  width: number;
  height: number;
  pixelRatio?: number;
}

export async function POST(request: NextRequest) {
  let browser: Browser | null = null;
  
  try {
    const { html, css, canvasStyles, width, height, pixelRatio = 2 }: ScreenshotRequest = await request.json();

    // Validate input
    if (!html || !width || !height) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Clean the HTML to remove editor-specific elements and attributes
    const cleanHTML = html
      .replace(/data-element-id="[^"]*"/g, '') // Remove element IDs that might interfere
      .replace(/class="[^"]*z-editor-canvas-controls[^"]*"/g, 'class=""') // Remove editor control classes
      .replace(/style="[^"]*position:\s*fixed[^"]*"/g, '') // Remove fixed positioning
      .replace(/contentEditable="[^"]*"/g, '') // Remove contentEditable attributes
      .replace(/suppressContentEditableWarning="[^"]*"/g, ''); // Remove React-specific attributes

    // Create a complete HTML document optimized for screenshot rendering
    const fullHTML = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Inter', sans-serif;
              background: transparent;
              width: ${width}px;
              height: ${height}px;
              overflow: hidden;
            }
            
            .screenshot-container {
              width: ${width}px;
              height: ${height}px;
              position: relative;
              overflow: hidden;
              background: ${canvasStyles.backgroundColor || '#ffffff'};
            }
            
            /* Reset and base styles */
            ${css}
            
            /* Override editor-specific styles that shouldn't appear in screenshots */
            .z-editor-canvas-controls,
            .selection-border,
            .resize-handle,
            [class*="border-active"],
            [class*="border-default"],
            [data-element-id][style*="position: fixed"] {
              display: none !important;
              visibility: hidden !important;
            }
            
            /* Ensure text elements render properly */
            .text-element {
              font-family: ${canvasStyles.fontFamily || 'Inter, sans-serif'} !important;
              color: ${canvasStyles.color || '#000000'} !important;
              line-height: 1.2;
            }
            
            /* Ensure proper positioning and remove editor artifacts */
            [data-canvas] {
              transform: none !important;
              border: none !important;
              box-shadow: none !important;
              position: relative !important;
            }
            
            /* Ensure elements are positioned correctly */
            [data-element-id] {
              position: absolute !important;
            }
            
            /* Force visibility of canvas elements */
            [data-canvas] * {
              visibility: visible !important;
            }
            
            /* Prevent text selection artifacts */
            * {
              -webkit-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
            }
            
            /* Ensure contentEditable elements render as static text */
            [contenteditable] {
              -webkit-user-modify: read-only;
            }
          </style>
        </head>
        <body>
          <div class="screenshot-container">
            ${cleanHTML}
          </div>
        </body>
      </html>
    `;

    console.log('Launching Puppeteer for screenshot generation...');

    // Launch Puppeteer with optimized settings for screenshots
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--single-process',
        '--disable-extensions',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    });

    const page = await browser.newPage();
    
    // Set viewport to match canvas size with high DPI
    await page.setViewport({
      width: Math.ceil(width),
      height: Math.ceil(height),
      deviceScaleFactor: pixelRatio
    });

    // Load the HTML content and wait for everything to render
    await page.setContent(fullHTML, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000
    });

    // Wait for fonts to load and render
    await page.evaluateOnNewDocument(() => {
      return document.fonts.ready;
    });
    
    // Additional wait to ensure all styling is applied
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Taking screenshot...');

    // Take screenshot of the entire viewport
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: Math.ceil(width),
        height: Math.ceil(height)
      },
      omitBackground: false
    });

    // Convert to base64
    const base64Image = Buffer.from(screenshot).toString('base64');

    console.log('Screenshot generated successfully');

    return NextResponse.json({
      success: true,
      imageData: base64Image
    });

  } catch (error) {
    console.error('Screenshot generation failed:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  } finally {
    // Always close the browser
    if (browser) {
      await browser.close();
    }
  }
}
