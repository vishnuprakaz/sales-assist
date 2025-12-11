/**
 * Two Panel Layout Component
 * 
 * Professional layout with resizable left (main) and right (agent response) panels
 * Right panel can be controlled by agent and user with smooth animations
 */

import { useState, useCallback, type ReactNode } from 'react';
import { DraggableSplitter } from './DraggableSplitter';
import { AgentResponsePanel } from './AgentResponsePanel';

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

  return (
    <div className="flex h-full">
      {/* Left Panel - Main Content */}
      <div 
        className="flex-shrink-0 h-full overflow-hidden"
        style={{ 
          width: agentPanelVisible ? leftPanelWidth : '100%',
          transition: agentPanelVisible ? 'none' : 'width 300ms ease-out'
        }}
      >
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </div>

      {/* Draggable Splitter - only show when right panel is visible */}
      {agentPanelVisible && (
        <DraggableSplitter
          onResize={handleResize}
          minLeftWidth={400}
          maxLeftWidth={window.innerWidth - 64 - minPanelWidth - 4}
          initialLeftWidth={leftPanelWidth}
        />
      )}

      {/* Right Panel - Agent Response */}
      {agentPanelVisible && (
        <div 
          className="flex-shrink-0 h-full"
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