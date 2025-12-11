/**
 * App Layout Component
 * 
 * Main layout wrapper with two-panel design and agent response system
 */

import { useState, type ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { InputBox } from './InputBox';
import { TwoPanelLayout } from './TwoPanelLayout';
import { usePageContext } from '@/hooks/useUIContext';

interface AgentMessage {
  id: string;
  type: 'text' | 'thinking' | 'component';
  content: string;
  timestamp: number;
  streaming?: boolean;
}

interface AppLayoutProps {
  children: ReactNode;
  pageName?: string;
}

export function AppLayout({ children, pageName = 'dashboard' }: AppLayoutProps) {
  // Track page context
  usePageContext(pageName);

  // Agent panel state
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([]);
  const [isAgentProcessing, setIsAgentProcessing] = useState(false);
  const [isAgentPanelVisible, setIsAgentPanelVisible] = useState(false);

  const handleMessageSubmit = (message: string, files?: any[], context?: any[]) => {
    console.log('Message submitted:', message);
    if (files?.length) console.log('Files attached:', files);
    if (context?.length) console.log('Context chips:', context);
    
    // Show agent panel when user submits a message
    setIsAgentPanelVisible(true);
    setIsAgentProcessing(true);
    
    // Add thinking message
    const thinkingMessage: AgentMessage = {
      id: `thinking-${Date.now()}`,
      type: 'thinking',
      content: 'Analyzing your request...',
      timestamp: Date.now()
    };
    setAgentMessages(prev => [...prev, thinkingMessage]);

    // Simulate agent response (replace with real API call)
    setTimeout(() => {
      setIsAgentProcessing(false);
      
      // Remove thinking message and add response
      setAgentMessages(prev => prev.filter(m => m.type !== 'thinking').concat([
        {
          id: `response-${Date.now()}`,
          type: 'text',
          content: `I received your message: "${message}"\n\nThis is a simulated response. In the real implementation, this will be connected to the backend agents through the message service.`,
          timestamp: Date.now()
        }
      ]));
    }, 2000);

    // TODO: Connect to real message service (T008)
  };

  const handleToggleAgentPanel = () => {
    setIsAgentPanelVisible(!isAgentPanelVisible);
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Two Panel Layout */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden pt-14 pb-36">
            <TwoPanelLayout
              messages={agentMessages}
              isProcessing={isAgentProcessing}
              agentPanelVisible={isAgentPanelVisible}
              onToggleAgentPanel={handleToggleAgentPanel}
            >
              <div className="p-6 h-full">
                {children}
              </div>
            </TwoPanelLayout>
          </div>

          {/* Sophisticated Input Box */}
          <InputBox onSubmit={handleMessageSubmit} isProcessing={isAgentProcessing} />
        </div>
      </div>
    </div>
  );
}

