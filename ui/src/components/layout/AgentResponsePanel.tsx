/**
 * Agent Response Panel Component
 * 
 * Right-side panel for displaying AI responses, processing indicators, and dynamic content
 * Can be controlled by both agent and user, with smooth animations
 */

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentMessage {
  id: string;
  type: 'text' | 'thinking' | 'component';
  content: string;
  timestamp: number;
  streaming?: boolean;
}

interface AgentResponsePanelProps {
  isVisible: boolean;
  onToggleVisibility: () => void;
  messages: AgentMessage[];
  isProcessing?: boolean;
  className?: string;
}

export function AgentResponsePanel({ 
  isVisible, 
  onToggleVisibility, 
  messages = [],
  isProcessing = false,
  className 
}: AgentResponsePanelProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "h-full bg-background border-l border-border flex flex-col",
        "animate-in slide-in-from-right duration-300",
        isMinimized && "h-12",
        className
      )}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-foreground">
            {isProcessing ? 'AI is thinking...' : 'Agent Response'}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4" />
            ) : (
              <Minimize2 className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            onClick={onToggleVisibility}
            title="Close panel"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Panel Content */}
      {!isMinimized && (
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !isProcessing ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-sm">Ask me anything to get started</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div key={message.id} className="space-y-2">
                    {message.type === 'thinking' ? (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                        <span className="text-sm text-muted-foreground">
                          {message.content}
                        </span>
                      </div>
                    ) : message.type === 'text' ? (
                      <div className="space-y-2">
                        <div className="prose prose-sm max-w-none">
                          <div className="text-sm text-foreground whitespace-pre-wrap">
                            {message.content}
                            {message.streaming && (
                              <span className="inline-block w-2 h-4 bg-foreground animate-pulse ml-1" />
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-accent/50 rounded-lg border border-border">
                        <div className="text-sm text-muted-foreground mb-2">Dynamic Component</div>
                        <div className="bg-background p-3 rounded border">
                          {/* Placeholder for dynamic components */}
                          <div className="text-sm">{message.content}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Processing indicator */}
                {isProcessing && (
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span className="text-sm text-emerald-700">Processing your request...</span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Quick Actions Footer */}
          <div className="p-3 border-t border-border bg-muted/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span>Live responses</span>
              </div>
              <div className="w-px h-3 bg-border" />
              <span>{messages.length} message{messages.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}