import { useState, useRef, useEffect, useCallback } from 'react';
import { Upload } from 'lucide-react';

interface MasonryItem {
  id: string;
  src: string;
  alt: string;
  onClick?: () => void;
  width: number;
  height: number;
}

interface MasonryLayoutProps {
  items: MasonryItem[];
  className?: string;
  itemClassName?: string;
  columnCount?: number;
  gap?: number;
  loading?: boolean;
  emptyMessage?: string;
  onFilesDrop?: (files: File[]) => void;
  enableDragDrop?: boolean;
}

const MasonryLayout = ({ 
  items, 
  className = '', 
  itemClassName = '', 
  columnCount = 2,
  gap = 8,
  loading = false,
  emptyMessage = 'No items to display',
  onFilesDrop,
  enableDragDrop = false
}: MasonryLayoutProps) => {

  const [columns, setColumns] = useState<MasonryItem[][]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate column width based on container width
  const getColumnWidth = useCallback(() => {
    if (!containerRef.current) return 0;
    const containerWidth = containerRef.current.offsetWidth;
    return (containerWidth - (gap * (columnCount - 1))) / columnCount;
  }, [gap, columnCount]);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (enableDragDrop) {
      setIsDragOver(true);
    }
  }, [enableDragDrop]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (enableDragDrop && !e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, [enableDragDrop]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!enableDragDrop || !onFilesDrop) return;
    
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageFiles = droppedFiles.filter(file => 
      file.type.startsWith('image/') && 
      ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'].includes(file.type)
    );
    
    if (imageFiles.length > 0) {
      onFilesDrop(imageFiles);
    }
  }, [enableDragDrop, onFilesDrop]);

  // Distribute items across columns based on provided dimensions
  useEffect(() => {
    if (items.length === 0) {
      setColumns([]);
      return;
    }

    const columnWidth = getColumnWidth();
    if (columnWidth === 0) return;

    // Initialize columns
    const newColumns: MasonryItem[][] = Array(columnCount).fill(null).map(() => []);
    const columnHeights = Array(columnCount).fill(0);

    items.forEach((item) => {
      // Find the shortest column
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      
      // Add item to the shortest column
      newColumns[shortestColumnIndex].push(item);
      
      // Calculate actual height based on provided dimensions
      const aspectRatio = item.height / item.width;
      const imageHeight = columnWidth * aspectRatio;
      columnHeights[shortestColumnIndex] += imageHeight + gap;
    });

    setColumns(newColumns);
  }, [items, columnCount, gap, getColumnWidth]);

  // Handle resize events
  useEffect(() => {
    const handleResize = () => {
      // Force recalculation when container resizes
      setColumns([]);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', handleResize);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  // Show empty state
  if (items.length === 0) {
    return (
      <div 
        ref={containerRef}
        className={`flex items-center justify-center py-8 ${className} ${
          enableDragDrop ? 'border-2 border-dashed border-gray-300 rounded-lg min-h-[200px] transition-colors' : ''
        } ${
          isDragOver ? 'border-blue-400 bg-blue-50' : ''
        }`}
        onDragEnter={enableDragDrop ? handleDragEnter : undefined}
        onDragLeave={enableDragDrop ? handleDragLeave : undefined}
        onDragOver={enableDragDrop ? handleDragOver : undefined}
        onDrop={enableDragDrop ? handleDrop : undefined}
      >
        <div className="text-center">
          {enableDragDrop ? (
            <div className="flex flex-col items-center gap-3">
              <Upload className="h-8 w-8 text-gray-400" />
              <div className="text-sm text-gray-500">
                <span className="font-medium text-blue-600">Drop images here</span>
                <br />
                <span>Only image files are supported</span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">{emptyMessage}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`flex ${className} ${
        enableDragDrop ? 'relative' : ''
      }`}
      style={{ gap: `${gap}px` }}
      onDragEnter={enableDragDrop ? handleDragEnter : undefined}
      onDragLeave={enableDragDrop ? handleDragLeave : undefined}
      onDragOver={enableDragDrop ? handleDragOver : undefined}
      onDrop={enableDragDrop ? handleDrop : undefined}
    >
      {/* Drag overlay */}
      {enableDragDrop && isDragOver && (
        <div className="absolute inset-0 bg-blue-50 bg-opacity-90 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <Upload className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-sm font-medium text-blue-600">Drop images to upload</div>
          </div>
        </div>
      )}
      
      {columns.map((column, columnIndex) => (
        <div
          key={columnIndex}
          className="flex flex-col"
          style={{ 
            flex: 1,
            gap: `${gap}px`
          }}
        >
          {column.map((item) => {
            const columnWidth = getColumnWidth();
            const aspectRatio = item.height / item.width;
            const imageHeight = columnWidth * aspectRatio;
            
            return (
              <div
                key={item.id}
                className={`relative overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity shadow-sm ${itemClassName}`}
                onClick={item.onClick}
                style={{
                  height: `${imageHeight}px`
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover"
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default MasonryLayout;
