"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  className?: string
}

const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  ({ color, onChange, className }, ref) => {
    const [tempColor, setTempColor] = React.useState(color)

    React.useEffect(() => {
      setTempColor(color)
    }, [color])

    const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newColor = event.target.value
      setTempColor(newColor)
      onChange(newColor)
    }

    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-3 p-4", className)}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Color preview */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded border-2 border-gray-200"
            style={{ backgroundColor: tempColor }}
          />
          <span className="text-sm font-medium">{tempColor.toUpperCase()}</span>
        </div>

        {/* HTML5 color input */}
        <input
          type="color"
          value={tempColor}
          onChange={handleColorChange}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-full h-10 rounded cursor-pointer border border-gray-200 bg-transparent"
          style={{
            WebkitAppearance: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        />

        {/* Hex input */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Hex Color</label>
          <input
            type="text"
            value={tempColor}
            onChange={(e) => {
              const value = e.target.value
              if (value.match(/^#[0-9A-Fa-f]{0,6}$/)) {
                setTempColor(value)
                if (value.length === 7) {
                  onChange(value)
                }
              }
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="#000000"
          />
        </div>
      </div>
    )
  }
)
ColorPicker.displayName = "ColorPicker"

export { ColorPicker }
