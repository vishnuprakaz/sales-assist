/**
 * App Layout Component
 * 
 * Main layout wrapper that combines all layout components
 */

import type { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { InputBox } from './InputBox';
import { usePageContext } from '@/hooks/useUIContext';

interface AppLayoutProps {
  children: ReactNode;
  pageName?: string;
}

export function AppLayout({ children, pageName = 'dashboard' }: AppLayoutProps) {
  // Track page context
  usePageContext(pageName);

  const handleMessageSubmit = (message: string, files?: any[], context?: any[]) => {
    console.log('Message submitted:', message);
    if (files?.length) console.log('Files attached:', files);
    if (context?.length) console.log('Context chips:', context);
    // TODO: Connect to message service (T008)
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <Header />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area - adjusted for new input design */}
      <main className="ml-16 pt-14 pb-36 min-h-screen overflow-y-auto">
        <div className="p-6 max-h-full">
          {children}
        </div>
      </main>

      {/* Sophisticated Input Box */}
      <InputBox onSubmit={handleMessageSubmit} />
    </div>
  );
}

