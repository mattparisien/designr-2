import { Button } from "@/components/ui/button";
import { toPng } from 'html-to-image';
import { Download, FileImage, FileText, Settings } from "lucide-react";
import { useState } from "react";
import useEditorStore from "../../lib/stores/useEditorStore";

interface ExportPanelContentProps {
  onExport?: (format: string) => void;
}

export const ExportPanelContent = ({ onExport }: ExportPanelContentProps) => {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [quality, setQuality] = useState('high');
  const pages = useEditorStore(state => state.pages);
  const currentPageId = useEditorStore(state => state.currentPageId);

  const currentPage = pages.find(page => page.id === currentPageId);

  async function exportNode(node: HTMLElement, w: number, h: number) {
    console.log('Starting export...')
    // Important: force the size you want **before** capture
    const originalWidth = node.style.width;
    const originalHeight = node.style.height;
    
    node.style.width = `${w}px`;
    node.style.height = `${h}px`;

    try {
      const dataUrl = await toPng(node, {
        cacheBust: true,       // picks up freshly-loaded images
        width: w,
        height: h,
        pixelRatio: scale,     // use the scale from the slider
        backgroundColor: 'white',  // fallback background
        skipFonts: false,      // don't skip fonts
        includeQueryParams: true // include query params for font URLs
      });

      // download helper
      const link = document.createElement('a');
      link.download = 'design.png';
      link.href = dataUrl;
      link.click();
    } finally {
      // Restore original dimensions
      node.style.width = originalWidth;
      node.style.height = originalHeight;
    }
  }  const handleExport = async (format: string) => {
    console.log('Export clicked for format:', format);
    setIsExporting(format);
    try {
      // Find the canvas element using the data-canvas attribute
      const canvasElement = document.querySelector('[data-canvas]') as HTMLElement
      if (!canvasElement) {
        console.error('Could not find canvas element to export')
        return
      }

      // Ensure all fonts are loaded before export
      console.log('Loading fonts before export...');
      try {
        const { fontsAPI } = await import('@/lib/api/index');
        await fontsAPI.loadAllUserFonts();
        console.log('Fonts loaded successfully');
      } catch (fontError) {
        console.warn('Failed to load fonts:', fontError);
        // Continue with export even if fonts fail to load
      }

      // Wait a bit for fonts to be fully applied
      await new Promise(resolve => setTimeout(resolve, 100));

      const width = currentPage?.canvas?.width || 1080;
      const height = currentPage?.canvas?.height || 1080;

      switch (format) {
        case 'png':
          await exportNode(canvasElement, width * scale, height * scale)
          break
        case 'jpg':
          // Add JPG export logic when available
          console.log('JPG export not yet implemented')
          break
        case 'pdf':
          // Add PDF export logic when available
          console.log('PDF export not yet implemented')
          break
      }

      // Call onExport callback if provided
      onExport?.(format);
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(null)
    }
  }


  return (
    <div className="flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Download className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">Export Design</h3>
      </div>

      {/* Canvas Info */}
      {currentPage && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-2">Current Canvas</div>
          <div className="text-sm font-medium text-gray-800">
            {currentPage.canvas?.width || 800} × {currentPage.canvas?.height || 600} px
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {currentPage.elements?.length || 0} elements
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="space-y-4">
        {/* Image Formats */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Image Formats</h4>
          <div className="space-y-2">
            <Button
              onClick={() => handleExport('png')}
              disabled={isExporting === 'png'}
              className="w-full justify-start"
              variant="outline"
            >
              <FileImage className="h-4 w-4 mr-2" />
              {isExporting === 'png' ? 'Exporting PNG...' : 'Export as PNG'}
            </Button>

            {/* <Button
              onClick={() => handleExport('jpg')}
              disabled={isExporting === 'jpg'}
              className="w-full justify-start"
              variant="outline"
            >
              <FileImage className="h-4 w-4 mr-2" />
              {isExporting === 'jpg' ? 'Exporting JPG...' : 'Export as JPG'}
            </Button> */}
          </div>
        </div>

        {/* Document Formats */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Document Formats</h4>
          <div className="space-y-2">
            <Button
              onClick={() => handleExport('pdf')}
              disabled={isExporting === 'pdf'}
              className="w-full justify-start"
              variant="outline"
            >
              <FileText className="h-4 w-4 mr-2" />
              {isExporting === 'pdf' ? 'Exporting PDF...' : 'Export as PDF'}
            </Button>
          </div>
        </div>

        {/* Export Settings */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Export Settings
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Quality</span>
              <select
                className="text-sm border border-gray-300 rounded px-2 py-1"
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Scale</span>
              <select
                className="text-sm border border-gray-300 rounded px-2 py-1"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
              >
                <option value="1">1x</option>
                <option value="2">2x</option>
                <option value="3">3x</option>
              </select>
            </div>
          </div>
        </div>

        {/* Export Tips */}
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-xs text-blue-800">
            <div className="font-medium mb-1">💡 Export Tips:</div>
            <ul className="space-y-1 text-blue-700">
              <li>• PNG: Best for designs with transparency</li>
              <li>• JPG: Smaller file size, solid backgrounds</li>
              <li>• PDF: Vector format, great for print</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
