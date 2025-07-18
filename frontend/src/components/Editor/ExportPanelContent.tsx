import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { apiClient } from '@/lib/api'
import { Download, FileImage, FileText } from 'lucide-react'
import React, { useState } from 'react'

interface TemplateElement {
  type: string
  content?: string
  style?: {
    fontSize?: string
    fontWeight?: string
    fontFamily?: string
    color?: string
    backgroundColor?: string
  }
  x?: number
  y?: number
  width?: number
  height?: number
}

interface ExportPanelContentProps {
  templateData: {
    elements: TemplateElement[]
    [key: string]: unknown
  }
}

export const ExportPanelContent: React.FC<ExportPanelContentProps> = ({ templateData }) => {
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg' | 'pdf'>('png')
  const [quality, setQuality] = useState(90)
  const [scale, setScale] = useState(1)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      switch (exportFormat) {
        case 'png':
          await apiClient.exportPNG({ 
            templateData, 
            includeWatermark: false 
          })
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
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Export Options</h3>
        
        {/* Format Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Format</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setExportFormat('png')}
              className={`p-3 rounded-lg border-2 transition-all ${
                exportFormat === 'png' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <FileImage className="h-6 w-6 mx-auto mb-1" />
              <div className="text-xs font-medium">PNG</div>
            </button>
            <button
              onClick={() => setExportFormat('jpg')}
              className={`p-3 rounded-lg border-2 transition-all ${
                exportFormat === 'jpg' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <FileImage className="h-6 w-6 mx-auto mb-1" />
              <div className="text-xs font-medium">JPG</div>
            </button>
            <button
              onClick={() => setExportFormat('pdf')}
              className={`p-3 rounded-lg border-2 transition-all ${
                exportFormat === 'pdf' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <FileText className="h-6 w-6 mx-auto mb-1" />
              <div className="text-xs font-medium">PDF</div>
            </button>
          </div>
        </div>

        {/* Quality Slider for JPG */}
        {exportFormat === 'jpg' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Quality: {quality}%</label>
            <Slider
              value={[quality]}
              onValueChange={(value) => setQuality(value[0])}
              max={100}
              min={10}
              step={10}
              className="w-full"
            />
          </div>
        )}

        {/* Scale Slider */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Scale: {scale}x</label>
          <Slider
            value={[scale]}
            onValueChange={(value) => setScale(value[0])}
            max={3}
            min={0.5}
            step={0.5}
            className="w-full"
          />
        </div>
      </div>

      {/* Export Button */}
      <Button 
        onClick={handleExport} 
        disabled={isExporting}
        className="w-full"
      >
        <Download className="h-4 w-4 mr-2" />
        {isExporting ? 'Exporting...' : `Export as ${exportFormat.toUpperCase()}`}
      </Button>
    </div>
  )
}
