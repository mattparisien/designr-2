"use client"

import { FontUpload } from "@/components/ui/font-upload"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { useFonts } from "@/lib/hooks/useFonts"
import { cn } from "@/lib/utils"
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Minus,
  Plus,
  Settings,
  Strikethrough,
  Underline,
  Upload
} from "lucide-react"
import { forwardRef, ForwardRefRenderFunction, useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  DEFAULT_FONT_SIZE,
  DEFAULT_LETTER_SPACING,
  DEFAULT_LINE_HEIGHT,
  MAX_FONT_SIZE,
  MAX_LETTER_SPACING,
  MAX_LINE_HEIGHT,
  MIN_FONT_SIZE,
  MIN_LETTER_SPACING,
  MIN_LINE_HEIGHT,
  type TextAlignment
} from "../lib/constants"
import useEditorStore from "../lib/stores/useEditorStore"
import type { Element } from "../lib/types/canvas"; // Update import to use types directly
import { Toolbar, ToolbarButton, ToolbarIcon, ToolbarLabel } from "./Toolbar"



const Divider = () => <div className="h-5 w-px bg-gray-200 mx-1"></div>

interface ElementPropertyBarProps {
  selectedElement: Element | null
  onFontSizeChange: (size: number) => void
  onFontFamilyChange: (family: string) => void
  onTextAlignChange: (align: TextAlignment) => void
  onLetterSpacingChange?: (spacing: number) => void
  onLineHeightChange?: (height: number) => void
  onFormatChange?: (format: { bold?: boolean; italic?: boolean; underline?: boolean; strikethrough?: boolean }) => void
  onPositionChange?: (position: { x?: number; y?: number }) => void
  isHovering: boolean
  elementId: string | null
  canvasWidth: number
}

const ElementPropertyBarComponent: ForwardRefRenderFunction<HTMLDivElement, ElementPropertyBarProps> = ({
  selectedElement,
  onFontSizeChange,
  onFontFamilyChange,
  onTextAlignChange,
  onLetterSpacingChange,
  onLineHeightChange,
  onFormatChange,
  onPositionChange,
  canvasWidth,
}, ref) => {
  const [fontSize, setFontSize] = useState(selectedElement?.fontSize || DEFAULT_FONT_SIZE)
  const [letterSpacing, setLetterSpacing] = useState(selectedElement?.letterSpacing || DEFAULT_LETTER_SPACING)
  const [lineHeight, setLineHeight] = useState(selectedElement?.lineHeight || DEFAULT_LINE_HEIGHT)
  const [showFontUpload, setShowFontUpload] = useState(false)

  // Add text formatting states
  const [isBold, setIsBold] = useState(selectedElement?.bold || false)
  const [isItalic, setIsItalic] = useState(selectedElement?.italic || false)
  const [isUnderlined, setIsUnderlined] = useState(selectedElement?.underline || false)
  const [isStrikethrough, setIsStrikethrough] = useState(selectedElement?.isStrikethrough || false)
  // Add position state

  const openSidebarPanel = useEditorStore((state) => state.openSidebarPanel);
  const closeSidebarPanel = useEditorStore((state) => state.closeSidebarPanel);
  const isPanelOpen = useEditorStore((state) => state.sidebarPanel.isOpen);

  // Get fonts from the custom hook
  const { allFonts, isCustomFont, deleteFontByName } = useFonts();
  const [fontFamily, setFontFamily] = useState(selectedElement?.fontFamily || allFonts[0] || "Inter")

  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)



  // Update local state when selected element changes
  useEffect(() => {
    if (selectedElement?.kind === "text") {
      setFontSize(selectedElement.fontSize || DEFAULT_FONT_SIZE)
      setFontFamily(selectedElement.fontFamily || allFonts[0] || "Inter")
      setLetterSpacing(selectedElement.letterSpacing || DEFAULT_LETTER_SPACING)
      setLineHeight(selectedElement.lineHeight || DEFAULT_LINE_HEIGHT)
      setIsBold(selectedElement.bold || false)
      setIsItalic(selectedElement.italic || false)
      setIsUnderlined(selectedElement.underline || false)
      setIsStrikethrough(selectedElement.isStrikethrough || false)
    }
  }, [selectedElement, allFonts])

  // Handle font size change
  const handleFontSizeChange = (newSize: number | string) => {
    // If empty string, just update the input value but don't apply the change
    if (newSize === '') {
      setFontSize('' as unknown as number);
      return;
    }

    // Convert to number and clamp value between min and max
    const sizeAsNumber = Number(newSize);
    const clampedSize = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, sizeAsNumber));
    setFontSize(clampedSize);
    onFontSizeChange(clampedSize);
  }

  // Handle font family change
  const handleFontFamilyChange = (newFamily: string) => {
    setFontFamily(newFamily)
    onFontFamilyChange(newFamily)
  }

  // Handle text formatting changes - DRY approach with unified handler
  const handleFormatChange = (formatType: 'bold' | 'italic' | 'underline' | 'strikethrough') =>
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const currentValue = {
        bold: isBold,
        italic: isItalic,
        underline: isUnderlined,
        strikethrough: isStrikethrough
      }[formatType];

      const newValue = !currentValue;

      // Update local state
      switch (formatType) {
        case 'bold':
          setIsBold(newValue);
          break;
        case 'italic':
          setIsItalic(newValue);
          break;
        case 'underline':
          setIsUnderlined(newValue);
          break;
        case 'strikethrough':
          setIsStrikethrough(newValue);
          break;
      }

      // Call parent handler
      if (onFormatChange) {
        onFormatChange({ [formatType]: newValue });
      }
    };

  // Handle letter spacing change
  const handleLetterSpacingChange = (value: number[]) => {
    const newSpacing = value[0];
    setLetterSpacing(newSpacing);
    if (onLetterSpacingChange) {
      onLetterSpacingChange(newSpacing);
    }
  }

  // Handle line height change
  const handleLineHeightChange = (value: number[]) => {
    const newHeight = value[0];
    setLineHeight(newHeight);
    if (onLineHeightChange) {
      onLineHeightChange(newHeight);
    }
  }

  // Handle horizontal positioning changes
  const handleAlignStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedElement || !onPositionChange) return;
    onPositionChange({ x: 0 });
  }

  const handleAlignCenter = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedElement || !onPositionChange) return;
    const centerX = (canvasWidth - selectedElement.width) / 2;
    onPositionChange({ x: centerX });
  }

  const handleAlignEnd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedElement || !onPositionChange) return;
    const endX = canvasWidth - selectedElement.width;
    onPositionChange({ x: endX });
  }

  // Handle mouse enter/leave for the toolbar itself
  const handleToolbarMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
  }

  const handleToolbarMouseLeave = () => {
  }

  // Function to stop propagation of click events
  const handleToolbarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleTextColorButtonClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPanelOpen) {
      openSidebarPanel("text-color");
    } else {
      closeSidebarPanel();
    }
  }, [isPanelOpen, openSidebarPanel, closeSidebarPanel]);

  const handleBackgroundColorButtonClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    openSidebarPanel("background-color");
  }, [openSidebarPanel]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [])

  // Determine if we're dealing with a text element or shape element
  const isTextElement = selectedElement?.kind === "text";
  const isShapeElement = selectedElement && !isTextElement;

  return (
    <>
      <Toolbar
        onMouseEnter={handleToolbarMouseEnter}
        onMouseLeave={handleToolbarMouseLeave}
        onClick={handleToolbarClick}
        className="top-5 py-[3px] px-[4px]"
        ref={ref}
      >
        {/* Text Element Controls - Show all text-related controls */}
        {isTextElement && (
          <>
            {/* Font Family Dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <ToolbarButton className="w-[100px] border border-gray-200">
                  <ToolbarLabel label={fontFamily} className="truncate" />
                </ToolbarButton>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-0" align="start">
                <div className="max-h-60 overflow-y-auto w-full">
                  {/* Upload Font Button */}
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 flex items-center gap-2 text-blue-600 font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFontUpload(true);
                    }}
                  >
                    <Upload className="h-4 w-4" />
                    Upload Font
                  </button>

                  {/* Font List */}
                  {allFonts.map((font: string) => (
                    <div key={font} className="flex items-center">
                      <button
                        className={cn(
                          "flex-1 text-left px-4 py-2 text-sm hover:bg-gray-50",
                          fontFamily === font ? "bg-gray-50 font-medium text-brand-blue" : "",
                        )}
                        style={{ fontFamily: font }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFontFamilyChange(font);
                        }}
                      >
                        {font}
                      </button>

                      {/* Delete button for custom fonts */}
                      {isCustomFont(font) && (
                        <button
                          className="px-2 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-r-xl"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete font "${font}"?`)) {
                              try {
                                await deleteFontByName(font);
                                // If this was the active font, switch to the first available font
                                if (fontFamily === font) {
                                  const remainingFonts = allFonts.filter(f => f !== font);
                                  if (remainingFonts.length > 0) {
                                    handleFontFamilyChange(remainingFonts[0]);
                                  }
                                }
                              } catch (error) {
                                console.error('Failed to delete font:', error);
                              }
                            }
                          }}
                          title="Delete custom font"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>


            {/* Font Size Controls */}
            <div className="flex items-center">
              <div className="flex items-stretch rounded-lg overflow-hidden border border-gray-200">

                <ToolbarButton onClick={(e) => {
                  e.stopPropagation();
                  handleFontSizeChange(fontSize - 1);
                }}>
                  <ToolbarIcon icon={Minus} />
                </ToolbarButton>

                <input
                  type="number"
                  value={fontSize}
                  min={MIN_FONT_SIZE}
                  max={MAX_FONT_SIZE}
                  placeholder="– –"
                  onChange={(e) => handleFontSizeChange(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-12 px-1.5 py-0.5 text-sm font-medium focus:ring-1 focus:ring-brand-blue focus:outline-none text-center border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />

                <ToolbarButton onClick={(e) => {
                  e.stopPropagation();
                  handleFontSizeChange(fontSize + 1);
                }}>
                  <ToolbarIcon icon={Plus} />
                </ToolbarButton>
              </div>
            </div>

            {/* Text Color with Hue Bar */}
            <ToolbarButton onClick={handleTextColorButtonClick} title="Text Color" direction="col">
              <div className="w-6 h-6 rounded-full bg-center bg-repeat bg-contain border-[0.8px] border-neutral-400" style={{
                backgroundColor: selectedElement?.color || 'var(--color-text-primary)',
              }}></div>
            </ToolbarButton>

            <Divider />

            {/* Text Formatting */}
            <div className="flex items-center space-x-1">
              <ToolbarButton onClick={handleFormatChange('bold')} isActive={isBold}>
                <ToolbarIcon icon={Bold} />
              </ToolbarButton>
              <ToolbarButton onClick={handleFormatChange('italic')} isActive={isItalic}>
                <ToolbarIcon icon={Italic} />
              </ToolbarButton>
              <ToolbarButton onClick={handleFormatChange('underline')} isActive={isUnderlined}>
                <ToolbarIcon icon={Underline} />
              </ToolbarButton>
              <ToolbarButton onClick={handleFormatChange('strikethrough')} isActive={isStrikethrough} rounded="lg">
                <ToolbarIcon icon={Strikethrough} />
              </ToolbarButton>
            </div>

            <Divider />

            {/* Letter Spacing Control */}
            <Popover>
              <PopoverTrigger asChild>
                <ToolbarButton className="px-3 py-1.5 text-gray-700 hover:bg-gray-50 hover:text-brand-blue transition text-sm font-medium flex items-center gap-2">
                  <ToolbarIcon icon={Settings} />
                </ToolbarButton>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4 bg-white border border-gray-100 rounded-xl shadow-lg" data-editor-interactive="true">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Letter Spacing</label>
                    <span className="text-sm text-gray-500">{letterSpacing.toFixed(2)}em</span>
                  </div>
                  <Slider
                    value={[letterSpacing]}
                    onValueChange={handleLetterSpacingChange}
                    min={MIN_LETTER_SPACING}
                    max={MAX_LETTER_SPACING}
                    step={0.01}
                    className="w-full"
                  />
                </div>
              </PopoverContent>
            </Popover>

            {/* Line Height Control */}
            <Popover>
              <PopoverTrigger asChild>
                <ToolbarButton className="px-3 py-1.5 text-gray-700 hover:bg-gray-50 hover:text-brand-blue transition text-sm font-medium flex items-center gap-2">
                  <ToolbarIcon icon={AlignJustify} />
                </ToolbarButton>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4 bg-white border border-gray-100 rounded-xl shadow-lg" data-editor-interactive="true">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Line Height</label>
                    <span className="text-sm text-gray-500">{lineHeight.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[lineHeight]}
                    onValueChange={handleLineHeightChange}
                    min={MIN_LINE_HEIGHT}
                    max={MAX_LINE_HEIGHT}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </PopoverContent>
            </Popover>

            <Divider />

            {/* Text Alignment */}
            <TextAlignButton onTextAlignChange={onTextAlignChange} />
            {/* <div className="flex items-center">
              <ToolbarButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleTextAlignChange("left");
                }}
                isActive={textAlign === "left"}
                rounded="lg"
              >
                <ToolbarIcon icon={AlignLeft} />
              </ToolbarButton>
              <ToolbarButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleTextAlignChange("center");
                }}
                isActive={textAlign === "center"}
                rounded="lg"
              >
                <ToolbarIcon icon={AlignCenter} />
              </ToolbarButton>
              <ToolbarButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleTextAlignChange("right");
                }}
                isActive={textAlign === "right"}
                rounded="lg"
              >
                <ToolbarIcon icon={AlignRight} />
              </ToolbarButton>
            </div> */}

            <Divider />
          </>
        )}

        {/* Shape Element Controls - Show color control for shapes */}
        {isShapeElement && (
          <>
            {/* Shape Color with Hue Wheel */}
            <ToolbarButton onClick={handleBackgroundColorButtonClick} title="Shape Color">
              <div className="w-5 h-5 bg-center bg-contain rounded-full border-[0.8px] border-neutral-400" style={{
                backgroundImage: `url(/assets/hue-wheel.png)`
              }}></div>
            </ToolbarButton>

            <Divider />
          </>
        )}

        {/* Position Controls - Show for both text and shape elements */}
        <div className="flex items-center">
          <Popover>
            <PopoverTrigger asChild>
              <button className="rounded-xl px-3 py-1.5 text-gray-700 hover:bg-gray-50 hover:text-brand-blue transition text-sm font-medium">Position</button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3 bg-white border border-gray-100 rounded-xl shadow-lg" data-editor-interactive="true">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 justify-between">
                  <ToolbarButton onClick={handleAlignStart}>
                    <ToolbarIcon icon={AlignLeft} />
                  </ToolbarButton>
                  <ToolbarButton onClick={handleAlignCenter}>
                    <ToolbarIcon icon={AlignCenter} />
                  </ToolbarButton>
                  <ToolbarButton onClick={handleAlignEnd}>
                    <ToolbarIcon icon={AlignRight} />
                  </ToolbarButton>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </Toolbar>

      {/* Font Upload Modal */}
      {showFontUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100001]">
          <FontUpload
            onFontUploaded={(fontFamily) => {
              handleFontFamilyChange(fontFamily);
              setShowFontUpload(false);
            }}
            onClose={() => setShowFontUpload(false)}
          />
        </div>
      )}
    </>
  )
}



const TextAlignButton = ({
  onTextAlignChange,
  initialAlignment = "center"
}: {
  onTextAlignChange: (align: TextAlignment) => void
  initialAlignment?: TextAlignment
}) => {

  const alignments: TextAlignment[] = ["left", "center", "right"];
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">(initialAlignment);

  const handleTextAlignChange = () => {
    const alignment: TextAlignment = alignments[alignments.indexOf(textAlign) + 1] || alignments[0];
    setTextAlign(alignment);
    onTextAlignChange(alignment)
  }

  const Icon = useMemo(() => {

    switch (textAlign) {
      case "left":
        return AlignLeft;
      case "center":
        return AlignCenter;
      case "right":
        return AlignRight;
      default:
        return AlignLeft; // Fallback
    }

  }, [textAlign])

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleTextAlignChange();
  }, [handleTextAlignChange])


  return (
    <ToolbarButton
      onClick={handleClick}
      rounded="lg"
    >
      <ToolbarIcon icon={Icon} />
    </ToolbarButton>
  )
}

export const ElementPropertyBar = forwardRef<HTMLDivElement, ElementPropertyBarProps>(ElementPropertyBarComponent);
