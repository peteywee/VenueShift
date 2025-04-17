import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { InterfaceToggle } from "@/components/interface-toggle";

interface WebLayoutProps {
  children: ReactNode;
  showBackupBanner?: boolean;
}

export function WebLayout({ children, showBackupBanner = false }: WebLayoutProps) {
  const { user, isLoading, logoutMutation } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if we're in demo mode
  const isDemoMode = window.location.pathname.includes('/demo');
  
  if (!user && !isDemoMode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Staff Management System
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Please log in to access the application
          </p>
        </div>
        <Link href="/auth">
          <Button className="bg-primary hover:bg-primary-dark text-white">
            Go to Login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <Header />
      
      {/* Backup Access Banner */}
      {showBackupBanner && (
        <div className="fixed top-16 inset-x-0 bg-amber-500 text-white z-50 py-2 px-4 text-center">
          <p className="text-sm">
            You are using the web backup interface. This interface is optimized for desktop use.
          </p>
        </div>
      )}
      
      {/* Main Content Area */}
      <div className={`pt-16 ${showBackupBanner ? 'pt-24' : 'pt-16'} pb-16 lg:pl-64 min-h-screen flex flex-col`}>
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 z-10">
          <Sidebar />
        </div>
        
        {/* Page Content */}
        <main className="flex-1 px-4 py-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      {/* Interface toggle button */}
      <InterfaceToggle 
        currentInterface="web"
        className="lg:right-8" 
      />
      
      {/* Bottom Navigation for Mobile */}
      <MobileNav />
    </div>
  );
}