/**
 * Draggable Splitter Component
 * 
 * Invisible/subtle drag handle for resizing panels in a two-panel layout
 * Provides smooth resizing with constraints and visual feedback
 */

import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface DraggableSplitterProps {
  onResize: (leftWidth: number) => void;
  minLeftWidth?: number;
  maxLeftWidth?: number;
  initialLeftWidth?: number;
  className?: string;
}

export function DraggableSplitter({
  onResize,
  minLeftWidth = 300,
  maxLeftWidth = 1000,
  initialLeftWidth = 600,
  className
}: DraggableSplitterProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [, setLeftWidth] = useState(initialLeftWidth);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const newLeftWidth = e.clientX - 64; // Account for sidebar width
    const constrainedWidth = Math.min(Math.max(newLeftWidth, minLeftWidth), maxLeftWidth);
    
    setLeftWidth(constrainedWidth);
    onResize(constrainedWidth);
  }, [isDragging, minLeftWidth, maxLeftWidth, onResize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      className={cn(
        "relative w-1 bg-transparent hover:bg-border/50 cursor-col-resize transition-colors duration-200 group",
        isDragging && "bg-primary/50",
        className
      )}
      onMouseDown={handleMouseDown}
    >
      {/* Visual indicator - only visible on hover or during drag */}
      <div 
        className={cn(
          "absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 bg-border/30 transition-all duration-200",
          "group-hover:bg-primary/50 group-hover:w-1.5",
          isDragging && "bg-primary w-1.5 shadow-lg"
        )}
      />
      
      {/* Extended hover area for easier interaction */}
      <div className="absolute inset-y-0 -left-2 -right-2" />
      
      {/* Drag indicator dots - only show during drag */}
      {isDragging && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1">
          <div className="w-1 h-1 bg-primary rounded-full" />
          <div className="w-1 h-1 bg-primary rounded-full" />
          <div className="w-1 h-1 bg-primary rounded-full" />
        </div>
      )}
    </div>
  );
}