import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, Monitor } from "lucide-react";
import { useState } from "react";
import { SOCIAL_MEDIA_FORMATS, SOCIAL_FORMAT_CATEGORIES, SocialFormat } from "../../lib/constants/socialFormats";
import useEditorStore from "../../lib/stores/useEditorStore";
import { cn } from "@/lib/utils";

interface DesignPanelContentProps {
  onCanvasResize?: (width: number, height: number) => void;
}

export const DesignPanelContent = ({ onCanvasResize }: DesignPanelContentProps) => {
  const [isResizeDropdownOpen, setIsResizeDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const currentPage = useEditorStore(state => state.pages.find(p => p.id === state.currentPageId));
  const currentPageId = useEditorStore(state => state.currentPageId);
  const updatePageCanvasSize = useEditorStore(state => state.updatePageCanvasSize);
  
  const currentCanvasSize = currentPage?.canvas || { width: 1080, height: 1080 };

  const handleFormatSelect = (format: SocialFormat) => {
    if (!currentPageId) return;
    
    // Update the canvas size in the store
    updatePageCanvasSize(currentPageId, { 
      name: format.name, 
      width: format.width, 
      height: format.height,
      category: format.category
    });
    
    // Call the callback if provided
    if (onCanvasResize) {
      onCanvasResize(format.width, format.height);
    }
    
    setIsResizeDropdownOpen(false);
  };

  const getFormatsByCategory = (category: string) => {
    return Object.entries(SOCIAL_MEDIA_FORMATS)
      .filter(([, format]) => format.category === category)
      .map(([key, format]) => ({ key, ...format }));
  };

  const getCurrentFormatName = () => {
    const matchingFormat = Object.values(SOCIAL_MEDIA_FORMATS).find(
      format => format.width === currentCanvasSize.width && format.height === currentCanvasSize.height
    );
    return matchingFormat ? matchingFormat.name : `${currentCanvasSize.width} × ${currentCanvasSize.height}`;
  };

  return (
    <div className="flex flex-col p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Canvas Size</h3>
        
        {/* Current canvas size display */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <Monitor className="h-4 w-4" />
            <span>Current Size</span>
          </div>
          <div className="text-base font-medium">
            {getCurrentFormatName()}
          </div>
          <div className="text-sm text-gray-500">
            {currentCanvasSize.width} × {currentCanvasSize.height} px
          </div>
        </div>

        {/* Resize dropdown */}
        <Popover open={isResizeDropdownOpen} onOpenChange={setIsResizeDropdownOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between"
              size="lg"
            >
              <span>Resize Canvas</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="start">
            <div className="max-h-96 overflow-y-auto">
              {/* Category tabs */}
              <div className="sticky top-0 bg-white border-b p-2">
                <div className="flex gap-1 overflow-x-auto">
                  <Button
                    variant={selectedCategory === null ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                    className="whitespace-nowrap"
                  >
                    All
                  </Button>
                  {SOCIAL_FORMAT_CATEGORIES.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="whitespace-nowrap"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Format list */}
              <div className="p-2">
                {selectedCategory ? (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">{selectedCategory}</h4>
                    <div className="space-y-1">
                      {getFormatsByCategory(selectedCategory).map(format => (
                        <button
                          key={format.key}
                          onClick={() => handleFormatSelect(format)}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-50 transition-colors",
                            currentCanvasSize.width === format.width && currentCanvasSize.height === format.height
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700"
                          )}
                        >
                          <div className="font-medium">{format.name}</div>
                          <div className="text-xs text-gray-500">
                            {format.width} × {format.height}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {SOCIAL_FORMAT_CATEGORIES.map(category => (
                      <div key={category}>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">{category}</h4>
                        <div className="space-y-1">
                          {getFormatsByCategory(category).slice(0, 3).map(format => (
                            <button
                              key={format.key}
                              onClick={() => handleFormatSelect(format)}
                              className={cn(
                                "w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-50 transition-colors",
                                currentCanvasSize.width === format.width && currentCanvasSize.height === format.height
                                  ? "bg-blue-50 text-blue-700"
                                  : "text-gray-700"
                              )}
                            >
                              <div className="font-medium">{format.name}</div>
                              <div className="text-xs text-gray-500">
                                {format.width} × {format.height}
                              </div>
                            </button>
                          ))}
                          {getFormatsByCategory(category).length > 3 && (
                            <button
                              onClick={() => {
                                setSelectedCategory(category);
                              }}
                              className="w-full text-left px-3 py-2 rounded-md text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              View all {category} formats ({getFormatsByCategory(category).length})
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Additional design controls can be added here */}
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          <p>More design options coming soon...</p>
        </div>
      </div>
    </div>
  );
};
