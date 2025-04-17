import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Home,
  MapPin,
  Users,
  Calendar,
  Clock,
  MessageSquare,
  DollarSign,
  Menu,
  X,
  Settings,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function MobileNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  // Fetch unread messages count
  const { data: unreadMessages = [] } = useQuery<any[]>({
    queryKey: ["/api/messages/unread"],
    enabled: !!user,
  });
  
  const unreadCount = unreadMessages?.length || 0;
  
  // Main bottom nav items (limited space)
  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/schedule", label: "Schedule", icon: Calendar },
    { href: "/timetracking", label: "Time", icon: Clock },
    { href: "/messages", label: "Messages", icon: MessageSquare, badge: unreadCount > 0 ? unreadCount : null },
  ];
  
  // All menu options for the full menu sheet
  const fullMenuItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { 
      label: "Venues", 
      icon: MapPin, 
      href: "/venues",
      submenu: [
        { href: "/venues", label: "All Venues" },
        { href: "/venues/map", label: "Venue Map" },
        { href: "/venues/new", label: "Add Venue" }
      ]
    },
    { 
      label: "Employees", 
      icon: Users, 
      href: "/employees",
      submenu: [
        { href: "/employees", label: "All Employees" },
        { href: "/employees/new", label: "Add Employee" },
        { href: "/employees/roles", label: "Manage Roles" }
      ]
    },
    { 
      label: "Schedule", 
      icon: Calendar,
      href: "/schedule",
      submenu: [
        { href: "/schedule", label: "Calendar View" },
        { href: "/schedule/shifts", label: "Shift Management" },
        { href: "/schedule/assignments", label: "Assign Shifts" }
      ]
    },
    { 
      label: "Time Tracking", 
      icon: Clock,
      href: "/timetracking",
      submenu: [
        { href: "/timetracking", label: "Clock In/Out" },
        { href: "/timetracking/history", label: "Time History" },
        { href: "/timetracking/reports", label: "Time Reports" }
      ]
    },
    { 
      label: "Till Verification", 
      icon: DollarSign,
      href: "/till-verification",
      submenu: [
        { href: "/till-verification", label: "Recent Verifications" },
        { href: "/till-verification/new", label: "New Verification" },
        { href: "/till-verification/reports", label: "Till Reports" }
      ]
    },
    { 
      label: "Messages", 
      icon: MessageSquare,
      href: "/messages",
      badge: unreadCount > 0 ? unreadCount : null,
      submenu: [
        { href: "/messages", label: "Inbox" },
        { href: "/messages/compose", label: "Send Message" },
        { href: "/messages/announcements", label: "Announcements" }
      ]
    },
    { 
      label: "Settings", 
      icon: Settings,
      href: "/settings",
      submenu: [
        { href: "/settings", label: "User Settings" },
        { href: "/settings/notifications", label: "Notifications" },
        { href: "/settings/security", label: "Security" }
      ]
    },
  ];
  
  return (
    <>
      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 z-20">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <a 
                  className={cn(
                    "flex flex-col items-center py-2 px-2",
                    isActive 
                      ? "text-primary dark:text-primary-light" 
                      : "text-neutral-500 dark:text-neutral-400"
                  )}
                >
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                    {item.badge && (
                      <Badge 
                        variant="default" 
                        className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-amber-500 text-[10px]"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs mt-1">{item.label}</span>
                </a>
              </Link>
            );
          })}
          
          {/* Full menu button */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <button 
                className="flex flex-col items-center py-2 px-2 text-neutral-500 dark:text-neutral-400"
              >
                <Menu className="h-5 w-5" />
                <span className="text-xs mt-1">Menu</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85%] sm:w-[350px] pt-10 z-50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Menu</h2>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-7 w-7" 
                  onClick={() => setIsSheetOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-6">
                {fullMenuItems.map((category) => (
                  <div key={category.href} className="space-y-2">
                    <Link href={category.href}>
                      <a 
                        className={cn(
                          "flex items-center text-base font-medium",
                          location === category.href
                            ? "text-primary dark:text-primary-light"
                            : "text-neutral-800 dark:text-neutral-200"
                        )}
                        onClick={() => setIsSheetOpen(false)}
                      >
                        <category.icon className="mr-2 h-5 w-5" />
                        {category.label}
                        {category.badge && (
                          <Badge className="ml-auto bg-amber-500 hover:bg-amber-600">
                            {category.badge}
                          </Badge>
                        )}
                      </a>
                    </Link>
                    
                    {category.submenu && (
                      <ul className="pl-7 space-y-2">
                        {category.submenu.map((subItem) => (
                          <li key={subItem.href}>
                            <Link href={subItem.href}>
                              <a 
                                className={cn(
                                  "text-sm block py-1",
                                  location === subItem.href
                                    ? "text-primary dark:text-primary-light"
                                    : "text-neutral-600 dark:text-neutral-400"
                                )}
                                onClick={() => setIsSheetOpen(false)}
                              >
                                {subItem.label}
                              </a>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </>
  );
}
