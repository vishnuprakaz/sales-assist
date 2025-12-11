/**
 * Two Panel Layout Component
 * 
 * Professional layout with resizable left (main) and right (agent response) panels
 * Right panel can be controlled by agent and user with smooth animations
 */

import { useState, useCallback, type ReactNode } from 'react';
import { DraggableSplitter } from './DraggableSplitter';
import { AgentResponsePanel } from './AgentResponsePanel';
import { cn } from '@/lib/utils';

interface AgentMessage {
  id: string;
  type: 'text' | 'thinking' | 'component';
  content: string;
  timestamp: number;
  streaming?: boolean;
}

interface TwoPanelLayoutProps {
  children: ReactNode;
  messages?: AgentMessage[];
  isProcessing?: boolean;
  agentPanelVisible?: boolean;
  onToggleAgentPanel?: () => void;
  initialPanelWidth?: number;
  minPanelWidth?: number;
  maxPanelWidth?: number;
}

export function TwoPanelLayout({
  children,
  messages = [],
  isProcessing = false,
  agentPanelVisible = false,
  onToggleAgentPanel,
  initialPanelWidth = 400,
  minPanelWidth = 300,
  maxPanelWidth = 600
}: TwoPanelLayoutProps) {
  const [rightPanelWidth, setRightPanelWidth] = useState(initialPanelWidth);
  const [leftPanelWidth, setLeftPanelWidth] = useState(800);

  const handleResize = useCallback((newLeftWidth: number) => {
    setLeftPanelWidth(newLeftWidth);
    // Right panel width is calculated as remainder minus splitter
    const availableWidth = window.innerWidth - 64; // Account for sidebar
    const newRightWidth = availableWidth - newLeftWidth - 4; // Account for splitter width
    setRightPanelWidth(Math.max(minPanelWidth, Math.min(maxPanelWidth, newRightWidth)));
  }, [minPanelWidth, maxPanelWidth]);

  const handleTogglePanel = useCallback(() => {
    onToggleAgentPanel?.();
  }, [onToggleAgentPanel]);

  const handleDragOpen = useCallback((newLeftWidth: number) => {
    // If panel is closed and user drags, open the panel
    if (!agentPanelVisible) {
      onToggleAgentPanel?.();
    }
    handleResize(newLeftWidth);
  }, [agentPanelVisible, onToggleAgentPanel, handleResize]);

  return (
    <div className="flex h-full relative">
      {/* Left Panel - Main Content */}
      <div 
        className="flex-shrink-0 h-full overflow-hidden"
        style={{ 
          width: agentPanelVisible ? leftPanelWidth : 'calc(100% - 12px)', // Leave space for drag handle
          transition: agentPanelVisible ? 'none' : 'width 300ms ease-out'
        }}
      >
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </div>

      {/* Always-visible Draggable Splitter */}
      <DraggableSplitter
        onResize={handleDragOpen}
        minLeftWidth={400}
        maxLeftWidth={typeof window !== 'undefined' ? window.innerWidth - 64 - minPanelWidth - 8 : 800}
        initialLeftWidth={leftPanelWidth}
        className={cn(
          "flex-shrink-0",
          agentPanelVisible ? "relative" : "absolute right-0 top-0 z-20"
        )}
        isOpen={agentPanelVisible}
      />

      {/* Right Panel - Agent Response */}
      {agentPanelVisible && (
        <div 
          className="flex-shrink-0 h-full animate-in slide-in-from-right duration-300"
          style={{ 
            width: rightPanelWidth,
            minWidth: minPanelWidth,
            maxWidth: maxPanelWidth
          }}
        >
          <AgentResponsePanel
            isVisible={agentPanelVisible}
            onToggleVisibility={handleTogglePanel}
            messages={messages}
            isProcessing={isProcessing}
          />
        </div>
      )}
    </div>
  );
}