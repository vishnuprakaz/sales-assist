/**
 * Sophisticated Input Box Component
 * 
 * Ultra-compact to full expansion with advanced state management and micro-interactions
 * Based on production design with context chips, file attachments, and smooth animations
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { KeyboardEvent, ChangeEvent, DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react';
import { useUIContext, useSelection } from '@/hooks/useUIContext';
import { cn } from '@/lib/utils';
import { getCurrentTheme } from '@/lib/theme';

interface ContextChip {
  id: string;
  type: string;
  label: string;
  data: any;
}

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  preview?: string;
}

interface InputBoxProps {
  onSubmit?: (message: string, files?: AttachedFile[], context?: ContextChip[]) => void;
  isProcessing?: boolean;
  sidebarExpanded?: boolean;
}

export function InputBox({ onSubmit, isProcessing = false, sidebarExpanded = false }: InputBoxProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [contextChips, setContextChips] = useState<ContextChip[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  const context = useUIContext();
  const { selectedItems } = useSelection();
  
  // Get current theme
  const theme = getCurrentTheme('light');

  // Determine expansion state
  const hasContent = message.trim().length > 0;
  const hasContext = contextChips.length > 0;
  const hasFiles = attachedFiles.length > 0;
  const isExpanded = isFocused || hasContent || hasContext || hasFiles;
  const showActions = isHovered || isFocused || hasContent || hasContext || hasFiles;

  // Update context chips when selections change
  useEffect(() => {
    const chips: ContextChip[] = selectedItems.map(item => ({
      id: item.id,
      type: item.type,
      label: item.data?.name || item.data?.title || `${item.type} ${item.id}`,
      data: item.data
    }));
    setContextChips(chips);
  }, [selectedItems]);

  // Get contextual placeholder
  const getPlaceholder = () => {
    if (isProcessing) return 'AI is thinking...';
    
    switch (context.page) {
      case 'leads':
        return 'Ask about leads...';
      case 'dashboard':
        return 'Ask me...';
      case 'settings':
        return 'Ask about settings...';
      default:
        return 'Ask about products...';
    }
  };

  const handleSubmit = useCallback(() => {
    if ((message.trim() || attachedFiles.length > 0) && !isProcessing) {
      onSubmit?.(message.trim(), attachedFiles, contextChips);
      setMessage('');
      setAttachedFiles([]);
      // Keep context chips until manually removed
    }
  }, [message, attachedFiles, contextChips, isProcessing, onSubmit]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setMessage('');
      inputRef.current?.blur();
    }
  };

  // File handling
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
    e.target.value = '';
  };

  const addFiles = useCallback(async (files: File[]) => {
    const newFiles: AttachedFile[] = [];
    
    for (const file of files) {
      const id = Math.random().toString(36).substring(2, 11);
      const attachedFile: AttachedFile = {
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        file
      };

      // Generate preview for images
      if (file.type.startsWith('image/')) {
        attachedFile.preview = URL.createObjectURL(file);
      }

      newFiles.push(attachedFile);
    }

    setAttachedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const removeFile = (id: string) => {
    setAttachedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const removeContextChip = (id: string) => {
    setContextChips(prev => prev.filter(chip => chip.id !== id));
  };

  // Drag and drop
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    if (!formRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  // Global keyboard shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div 
      className="fixed bottom-0 right-0 z-50 transition-all duration-[600ms]"
      style={{ 
        left: sidebarExpanded ? '200px' : '64px',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Background gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent"
        style={{ height: '120px' }}
      />
      
      <div className="relative flex justify-center items-center px-6 pb-6 pt-4">
        <form
          ref={formRef}
          className={cn(
            "relative rounded-[26px] border transition-all duration-[600ms] cubic-bezier-[0.4,0,0.2,1]",
            "flex flex-col justify-center overflow-visible",
            // Compact state: 180px × 44px
            !isExpanded && !showActions
              ? "w-[180px] h-[44px] gap-0"
              : "w-[70%] sm:w-[60%] md:w-[50%] lg:w-[45%] xl:w-[40%] min-h-[44px] gap-2 justify-start",
            // Expanded state styling
            showActions && "min-h-[110px] px-5 py-[18px] rounded-2xl",
            // Drag over state
            isDragOver && "border-2 border-dashed animate-pulse"
          )}
          style={{
            backgroundColor: theme.background.primary,
            borderColor: isFocused ? theme.border.hover : theme.border.primary,
            boxShadow: !isExpanded && !showActions 
              ? '0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)'
              : '0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)',
            padding: !isExpanded && !showActions ? '10px 12px 10px 18px' : undefined
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {/* Context chips - show at top when expanded */}
          {contextChips.length > 0 && showActions && (
            <div className="flex flex-wrap gap-1.5 w-full pb-1">
              {contextChips.map((chip) => (
                <div
                  key={chip.id}
                  className="inline-flex items-center gap-1.5 bg-emerald-700 text-white px-3 py-1 rounded-2xl text-sm font-medium animate-in fade-in duration-300"
                >
                  <span className="max-w-[150px] truncate">{chip.label}</span>
                  <button
                    type="button"
                    onClick={() => removeContextChip(chip.id)}
                    className="w-[18px] h-[18px] rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* File previews - show when files attached */}
          {attachedFiles.length > 0 && showActions && (
            <div className="w-full max-h-[120px] overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-2 mb-2">
              <div className="space-y-2">
                {attachedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-md"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 rounded-md flex items-center justify-center text-white">
                      {file.type.startsWith('image/') ? (
                        <ImageIcon className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{file.name}</div>
                      <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="w-6 h-6 rounded bg-gray-100 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main input row */}
          <div 
            className={cn(
              "flex items-center gap-2.5 w-full",
              showActions ? "h-8" : "h-6"
            )}
          >
            {/* Attachment button - only show when expanded */}
            {showActions && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="w-7 h-7 rounded-full flex-shrink-0 transition-all duration-200"
                style={{
                  backgroundColor: theme.background.secondary,
                  color: theme.text.secondary,
                  borderColor: theme.border.primary,
                }}
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                <Paperclip className="w-4 h-4" />
              </Button>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.txt,.pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Textarea */}
            <textarea
              ref={inputRef}
              placeholder={showActions ? getPlaceholder() : ""}
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isProcessing}
              rows={1}
              className={cn(
                "flex-1 bg-transparent border-none outline-none resize-none transition-all duration-500",
                showActions 
                  ? "text-base leading-8 px-4 py-3 min-h-[56px] opacity-100" 
                  : "text-sm leading-6 px-0 py-0 min-h-[24px] opacity-0 pointer-events-none"
              )}
              style={{ 
                color: theme.text.primary,
                lineHeight: showActions ? '32px' : '24px',
                transitionDelay: showActions ? '200ms' : '0ms'
              }}
            />

            {/* Send button */}
            <Button
              type="submit"
              disabled={(!message.trim() && attachedFiles.length === 0) || isProcessing}
              className={cn(
                "rounded-full border-0 flex-shrink-0 transition-all duration-500",
                showActions 
                  ? "w-10 h-10 hover:scale-105" 
                  : "w-[18px] h-[18px] hover:scale-110",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              style={{
                backgroundColor: theme.interactive.primary,
                color: theme.background.primary,
              }}
            >
              {isProcessing ? (
                <Loader2 className={cn("animate-spin", showActions ? "w-5 h-5" : "w-3 h-3")} />
              ) : (
                <Send className={cn(showActions ? "w-5 h-5 opacity-100" : "w-3 h-3 opacity-0")} />
              )}
            </Button>
          </div>

          {/* Actions row - only show when expanded */}
          {showActions && (
            <div className="flex items-center gap-2 px-1 opacity-100 h-auto transform-none transition-all duration-300 mt-1">
              {/* Placeholder for additional actions */}
              <div className="text-xs text-gray-400">
                {contextChips.length > 0 && `${contextChips.length} item${contextChips.length > 1 ? 's' : ''} selected`}
              </div>
            </div>
          )}

          {/* Collapsed state overlay text */}
          {!showActions && !isProcessing && (
            <div 
              className="absolute left-[18px] top-1/2 -translate-y-1/2 text-sm font-medium pointer-events-none select-none transition-opacity duration-200"
              style={{ 
                fontSize: '14px',
                color: theme.text.secondary
              }}
            >
              Ask me...
            </div>
          )}
        </form>
      </div>

    </div>
  );
}

