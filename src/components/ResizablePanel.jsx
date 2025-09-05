import React from 'react';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

export default function ResizablePanel({ 
  children, 
  width = 400, 
  height = 500, 
  minWidth = 300, 
  minHeight = 300,
  maxWidth = 1000,
  maxHeight = 1000,
  onResizeStop,
  className = ''
}) {
  return (
    <ResizableBox
      width={width}
      height={height}
      minConstraints={[minWidth, minHeight]}
      maxConstraints={[maxWidth, maxHeight]}
      resizeHandles={['se']} // Only show resize handle at bottom-right
      onResizeStop={onResizeStop}
      className={`border border-slate-700 rounded-lg overflow-hidden ${className}`}
    >
      <div className="w-full h-full overflow-auto">
        {children}
      </div>
    </ResizableBox>
  );
}