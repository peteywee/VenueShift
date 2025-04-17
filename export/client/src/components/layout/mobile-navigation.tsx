import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Building2, 
  Users, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Receipt, 
  Grid,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { useGestureNavigation } from '@/hooks/use-gesture-navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

// Navigation item for bottom bar
const NavItem = ({ href, icon, label, active }: NavItemProps) => {
  return (
    <Link href={href}>
      <div className={cn(
        "flex flex-col items-center justify-center h-full px-2 text-xs transition-colors",
        active 
          ? "text-primary font-medium" 
          : "text-muted-foreground hover:text-primary"
      )}>
        <div className="h-6 w-6 mb-1">{icon}</div>
        <span>{label}</span>
      </div>
    </Link>
  );
};

// Mobile navigation bar with gesture support
export function MobileNavigation() {
  const [location] = useLocation();
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const { goBack, canGoBack } = useGestureNavigation();
  const [showTapHint, setShowTapHint] = useState(false);
  
  // Show tap hint after first load for new users
  useEffect(() => {
    const hasSeen = localStorage.getItem('seen-swipe-hint');
    if (!hasSeen && isMobile) {
      // Show the hint 2 seconds after initial load
      const timer = setTimeout(() => {
        setShowTapHint(true);
        // Hide after 4 seconds
        setTimeout(() => {
          setShowTapHint(false);
          localStorage.setItem('seen-swipe-hint', 'true');
        }, 4000);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isMobile]);

  // If we're on auth page, don't show navigation
  if (location === '/auth') return null;
  
  // Determine if we're in web or mobile layout
  const isWebLayout = location.startsWith('/web');
  const path = isWebLayout ? location : location;
  
  // Map routes to simpler paths for matching
  const currentRoute = 
    path === '/' || path === '/web' ? 'home' :
    path.includes('venues') ? 'venues' : 
    path.includes('employees') ? 'employees' : 
    path.includes('schedule') ? 'schedule' : 
    path.includes('timetracking') ? 'timetracking' : 
    path.includes('messages') ? 'messages' : 
    path.includes('till-verification') ? 'till' : 
    path.includes('add-ons') ? 'addons' : 
    'home';
    
  const basePath = isWebLayout ? '/web' : '';
  
  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 h-16 bg-background border-t z-50 flex items-center justify-around px-1",
        "has-safe-area pb-[var(--safe-area-bottom)]",
        theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
      )}>
        <NavItem 
          href={`${basePath}/`} 
          icon={<Home className={cn("h-6 w-6", currentRoute === 'home' ? "fill-primary stroke-primary" : "")} />}
          label="Home"
          active={currentRoute === 'home'}
        />
        
        <NavItem 
          href={`${basePath}/venues`} 
          icon={<Building2 className={cn("h-6 w-6", currentRoute === 'venues' ? "fill-primary/20 stroke-primary" : "")} />}
          label="Venues"
          active={currentRoute === 'venues'}
        />
        
        <NavItem 
          href={`${basePath}/employees`} 
          icon={<Users className={cn("h-6 w-6", currentRoute === 'employees' ? "fill-primary/20 stroke-primary" : "")} />}
          label="Staff"
          active={currentRoute === 'employees'}
        />
        
        <NavItem 
          href={`${basePath}/schedule`} 
          icon={<Calendar className={cn("h-6 w-6", currentRoute === 'schedule' ? "fill-primary/20 stroke-primary" : "")} />}
          label="Schedule"
          active={currentRoute === 'schedule'}
        />
        
        {/* More button with sheet for additional items */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full">
              <Menu className="h-6 w-6" />
              <span className="sr-only">More</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-96 rounded-t-xl pt-6 has-safe-area pb-[var(--safe-area-bottom)]">
            <SheetHeader className="mb-5">
              <SheetTitle>More Options</SheetTitle>
              <SheetDescription>
                Access additional features and tools
              </SheetDescription>
            </SheetHeader>
            
            <div className="grid grid-cols-3 gap-4">
              <Link href={`${basePath}/timetracking`}>
                <div className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-lg border",
                  currentRoute === 'timetracking' ? "border-primary bg-primary/5" : "border-border"
                )}>
                  <Clock className={cn("h-8 w-8 mb-2", currentRoute === 'timetracking' ? "stroke-primary" : "")} />
                  <span className={cn("text-sm", currentRoute === 'timetracking' ? "text-primary" : "")}>
                    Time
                  </span>
                </div>
              </Link>
              
              <Link href={`${basePath}/messages`}>
                <div className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-lg border",
                  currentRoute === 'messages' ? "border-primary bg-primary/5" : "border-border"
                )}>
                  <MessageSquare className={cn("h-8 w-8 mb-2", currentRoute === 'messages' ? "stroke-primary" : "")} />
                  <span className={cn("text-sm", currentRoute === 'messages' ? "text-primary" : "")}>
                    Messages
                  </span>
                </div>
              </Link>
              
              <Link href={`${basePath}/till-verification`}>
                <div className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-lg border",
                  currentRoute === 'till' ? "border-primary bg-primary/5" : "border-border"
                )}>
                  <Receipt className={cn("h-8 w-8 mb-2", currentRoute === 'till' ? "stroke-primary" : "")} />
                  <span className={cn("text-sm", currentRoute === 'till' ? "text-primary" : "")}>
                    Till
                  </span>
                </div>
              </Link>
              
              <Link href={`${basePath}/add-ons`}>
                <div className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-lg border",
                  currentRoute === 'addons' ? "border-primary bg-primary/5" : "border-border"
                )}>
                  <Grid className={cn("h-8 w-8 mb-2", currentRoute === 'addons' ? "stroke-primary" : "")} />
                  <span className={cn("text-sm", currentRoute === 'addons' ? "text-primary" : "")}>
                    Add-ons
                  </span>
                </div>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Back button - shown conditionally */}
      {canGoBack && (
        <Button 
          variant="outline" 
          size="icon" 
          className="fixed left-4 top-4 z-50 h-10 w-10 rounded-full shadow-md bg-background/80 backdrop-blur-sm"
          onClick={() => goBack()}
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Go back</span>
        </Button>
      )}
      
      {/* Swipe gesture hint */}
      {showTapHint && (
        <div className="fixed inset-0 pointer-events-none z-[60] flex items-center justify-center">
          <div className="bg-black/70 text-white p-4 rounded-lg max-w-xs text-center animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-2">
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Swipe to navigate</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <p className="text-xs opacity-80">You can swipe left and right to navigate between pages</p>
          </div>
        </div>
      )}
    </>
  );
}

// Animation for fade-in effect
const fadeInAnimation = {
  from: { opacity: 0 },
  to: { opacity: 1 },
};