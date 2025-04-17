import React, { ReactNode } from 'react';
import { WebHeader } from './header';
import { WebSidebar } from './sidebar';
import { InterfaceToggle } from '@/components/interface-toggle';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WebLayoutProps {
  children: ReactNode;
}

export function WebLayout({ children }: WebLayoutProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <div className="hidden border-r bg-background md:block">
        <WebSidebar />
      </div>
      
      {/* Main content area */}
      <div className="flex flex-col">
        <WebHeader />
        
        <ScrollArea className="flex-1">
          <main className="flex-1 container py-6 md:py-8 px-4 md:px-8">
            {children}
          </main>
        </ScrollArea>
      </div>
    </div>
  );
}