import { Button } from "@/components/ui/button";
import { Download, FileImage, FileText, Settings } from "lucide-react";
import { useState } from "react";
import useEditorStore from "../../lib/stores/useEditorStore";
import { apiClient } from "@/lib/api";

interface ExportPanelContentProps {
  onExport?: (format: string) => void;
}

export const ExportPanelContent = ({ onExport }: ExportPanelContentProps) => {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const pages = useEditorStore(state => state.pages);
  const currentPageId = useEditorStore(state => state.currentPageId);
  
  const currentPage = pages.find(page => page.id === currentPageId);

  const handleExport = async (format: 'png' | 'jpg' | 'pdf') => {
    if (!currentPage) return;
    
    setIsExporting(format);
    
    try {
      // Prepare template data for export - convert Element[] to TemplateElement[]
      const templateData = {
        width: currentPage.canvas?.width || 800,
        height: currentPage.canvas?.height || 600,
        backgroundColor: currentPage.background?.type === 'color' ? currentPage.background.value : '#ffffff',
        elements: currentPage.elements?.map(element => ({
          type: element.kind, // Map 'kind' to 'type'
          content: element.content,
          style: {
            fontSize: element.fontSize ? `${element.fontSize}px` : undefined,
            fontWeight: element.bold ? 'bold' : 'normal',
            fontFamily: element.fontFamily,
            color: element.color,
            backgroundColor: element.backgroundColor,
          },
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
        })) || [],
      };

      let blob: Blob;

      switch (format) {
        case 'png':
          blob = await apiClient.exportPNG({ templateData });
          downloadBlob(blob, `design.png`);
          break;
        case 'jpg':
          // For JPG, we might need a different endpoint or conversion
          blob = await apiClient.exportPNG({ templateData });
          downloadBlob(blob, `design.jpg`);
          break;
        case 'pdf':
          // PDF export would need a separate implementation
          console.log('PDF export not yet implemented');
          break;
      }

      if (onExport) {
        onExport(format);
      }
    } catch (error) {
      console.error(`Error exporting as ${format}:`, error);
    } finally {
      setIsExporting(null);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

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
            
            <Button
              onClick={() => handleExport('jpg')}
              disabled={isExporting === 'jpg'}
              className="w-full justify-start"
              variant="outline"
            >
              <FileImage className="h-4 w-4 mr-2" />
              {isExporting === 'jpg' ? 'Exporting JPG...' : 'Export as JPG'}
            </Button>
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
              <select className="text-sm border border-gray-300 rounded px-2 py-1">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Scale</span>
              <select className="text-sm border border-gray-300 rounded px-2 py-1">
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
