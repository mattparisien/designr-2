import { useState, useRef, useEffect, useCallback } from 'react';

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
}

const MasonryLayout = ({ 
  items, 
  className = '', 
  itemClassName = '', 
  columnCount = 2,
  gap = 8,
  loading = false,
  emptyMessage = 'No items to display'
}: MasonryLayoutProps) => {



  const [columns, setColumns] = useState<MasonryItem[][]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate column width based on container width
  const getColumnWidth = useCallback(() => {
    if (!containerRef.current) return 0;
    const containerWidth = containerRef.current.offsetWidth;
    return (containerWidth - (gap * (columnCount - 1))) / columnCount;
  }, [gap, columnCount]);

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
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="text-sm text-gray-500">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`flex ${className}`}
      style={{ gap: `${gap}px` }}
    >
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
