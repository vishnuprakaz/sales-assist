/**
 * App Layout Component
 * 
 * Header with two-panel layout
 */

import { useState } from 'react';
import type { ReactNode } from 'react';
import { InputBox } from './InputBox';
import { DragHandle } from './DragHandle';

interface AppLayoutProps {
  children: ReactNode;
  pageName?: string;
}

export function AppLayout({}: AppLayoutProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // Percentage

  const handleMessageSubmit = (message: string, files?: any[], context?: any[]) => {
    console.log('Message submitted:', message);
    if (files?.length) console.log('Files attached:', files);
    if (context?.length) console.log('Context chips:', context);
  };

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    // Disable text selection during drag
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    
    const startX = e.clientX;
    const containerWidth = window.innerWidth - 64; // Subtract left nav width (64px = w-16)
    
    // If starting from a snapped position (0% or 100%), start from the edge
    let effectiveStartWidth = leftPanelWidth;
    if (leftPanelWidth === 0) {
      // Snapped to right panel - start from 0%
      effectiveStartWidth = 0;
    } else if (leftPanelWidth === 100) {
      // Snapped to left panel - start from 100%
      effectiveStartWidth = 100;
    }
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaPercent = (deltaX / containerWidth) * 100;
      let newWidth = effectiveStartWidth + deltaPercent;
      
      // Constrain between 0% and 100%
      newWidth = Math.max(0, Math.min(100, newWidth));
      
      setLeftPanelWidth(newWidth);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      
      // Use a small delay to ensure transition is applied for smooth snapping
      setTimeout(() => {
        setLeftPanelWidth(currentWidth => {
          // Special case: If starting from 0% (right panel full) and user drags left
          // Snap to 70% left panel (30% right panel)
          if (effectiveStartWidth === 0 && currentWidth > 0 && currentWidth < 50) {
            return 70;
          }
          
          // Special case: If starting from 100% (left panel full) and user drags right
          // Snap to 70% left panel (30% right panel)
          if (effectiveStartWidth === 100 && currentWidth < 100 && currentWidth > 50) {
            return 70;
          }
          
          // Snap behavior based on final position
          if (currentWidth < 50) {
            // Dragged below 50% - snap to show right panel only (0% left = 100% right)
            return 0;
          } else if (currentWidth > 80) {
            // Dragged far right - snap to show left panel only (100%)
            return 100;
          }
          // Otherwise keep the dragged position (50-80% range)
          return currentWidth;
        });
      }, 50); // Small delay to ensure isDragging is false and transition is applied
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="h-screen bg-gray-100 overflow-hidden flex flex-col">
      {/* Header */}
      <header className="h-16 bg-gray-100 flex">
        {/* Left Nav Panel - Same width as below */}
        <div className="w-64 bg-gray-100 flex items-center px-6">
          <span className="text-lg font-medium text-gray-700">Logo</span>
        </div>
        
        {/* Header Right Content */}
        <div className="flex-1 bg-gray-100">
          {/* Header content */}
        </div>
      </header>

      {/* Two Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Nav Panel - Minimized */}
        <div className="w-16 bg-gray-100">
          {/* Left nav content */}
        </div>

        {/* Main Content Area - Two Panels */}
        <div className="flex-1 flex overflow-hidden">
            {/* Left Panel - Main Dynamic Canvas */}
            <div 
              className="bg-gray-100 overflow-hidden flex flex-col"
              style={{ 
                width: `${leftPanelWidth}%`,
                transition: isDragging ? 'none' : 'width 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                padding: leftPanelWidth > 0 ? '1rem 0.5rem 1rem 1rem' : '0'
              }}
            >
              {/* Inner content wrapper with fixed width for sliding effect */}
              <div 
                className="h-full flex flex-col"
                style={{
                  width: leftPanelWidth < 50 ? 'calc(50vw - 64px - 1rem)' : '100%',
                  minWidth: leftPanelWidth < 50 ? 'calc(50vw - 64px - 1rem)' : 'auto'
                }}
              >
              {/* Sample Table Card - Full Height */}
              <div className="bg-white rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
                {/* Table Header */}
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">Leads Table</h2>
                </div>
                
                {/* Table Content - Scrollable */}
                <div className="flex-1 overflow-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-white border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Name</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Company</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-6 text-sm text-gray-800">John Doe</td>
                        <td className="py-3 px-6 text-sm text-gray-600">TechCorp</td>
                        <td className="py-3 px-6 text-sm">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Active</span>
                        </td>
                        <td className="py-3 px-6 text-sm text-gray-800">$50,000</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-6 text-sm text-gray-800">Jane Smith</td>
                        <td className="py-3 px-6 text-sm text-gray-600">StartupXYZ</td>
                        <td className="py-3 px-6 text-sm">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">Pending</span>
                        </td>
                        <td className="py-3 px-6 text-sm text-gray-800">$25,000</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-6 text-sm text-gray-800">Mike Johnson</td>
                        <td className="py-3 px-6 text-sm text-gray-600">Enterprise Inc</td>
                        <td className="py-3 px-6 text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">New</span>
                        </td>
                        <td className="py-3 px-6 text-sm text-gray-800">$100,000</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-6 text-sm text-gray-800">Sarah Wilson</td>
                        <td className="py-3 px-6 text-sm text-gray-600">Global Ltd</td>
                        <td className="py-3 px-6 text-sm">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Active</span>
                        </td>
                        <td className="py-3 px-6 text-sm text-gray-800">$75,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              </div>
            </div>

          {/* Drag Handle */}
          <DragHandle onMouseDown={handleDragStart} isDragging={isDragging} />

          {/* Right Panel - Agent Panel */}
          <div 
            className="bg-gray-100 overflow-hidden"
            style={{ 
              width: `${100 - leftPanelWidth}%`,
              transition: isDragging ? 'none' : 'width 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}
          >
            {/* Inner content wrapper with fixed width for sliding effect */}
            <div 
              className="h-full overflow-auto"
              style={{
                width: (100 - leftPanelWidth) < 20 ? 'calc(20vw - 64px)' : '100%',
                minWidth: (100 - leftPanelWidth) < 20 ? 'calc(20vw - 64px)' : 'auto',
                padding: (100 - leftPanelWidth) > 0 ? '1rem 1rem 1rem 0.5rem' : '0'
              }}
            >
            <div className="space-y-6">
              {/* Agent Text Response - Blends with background */}
              <div className="text-sm text-gray-700 leading-relaxed">
                <p className="mb-4">
                  I found 4 active leads in your pipeline. The highest value opportunity is with Enterprise Inc at $100,000. 
                  Would you like me to research any of these leads in detail?
                </p>
              </div>

              {/* Custom UI: List Component - With card wrapper */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Quick Actions</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 cursor-pointer">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Research selected lead
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 cursor-pointer">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Export to CSV
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 cursor-pointer">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Schedule follow-up
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 cursor-pointer">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    View analytics
                  </li>
                </ul>
              </div>

              {/* Agent Text Response - Blends with background */}
              <div className="text-sm text-gray-700 leading-relaxed">
                <p>Here's the pipeline breakdown based on the data:</p>
              </div>

              {/* Custom UI: Chart Component - With card wrapper */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Pipeline Value</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Active</span>
                      <span>$125k</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Pending</span>
                      <span>$25k</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>New</span>
                      <span>$100k</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Total Pipeline</span>
                    <span className="text-lg font-semibold text-gray-800">$250,000</span>
                  </div>
                </div>
              </div>

              {/* Agent Text Response - Blends with background */}
              <div className="text-sm text-gray-700 leading-relaxed">
                <p>Let me know if you'd like me to dive deeper into any specific lead or metric.</p>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Box */}
      <InputBox onSubmit={handleMessageSubmit} isProcessing={false} />
    </div>
  );
}