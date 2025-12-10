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

  const handleMessageSubmit = (message: string) => {
    console.log('Message submitted:', message);
    // TODO: Connect to message service (T008)
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="ml-16 pt-14 pb-32 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Input Box */}
      <InputBox onSubmit={handleMessageSubmit} />
    </div>
  );
}

