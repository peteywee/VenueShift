import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Home,
  MapPin,
  Users,
  Calendar,
  Clock,
  MessageSquare,
  Settings,
  Moon,
  Sun,
  DollarSign,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SidebarProps {
  setShowMobileMenu?: (show: boolean) => void;
}

export function Sidebar({ setShowMobileMenu }: SidebarProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  
  // Fetch unread messages count
  const { data: unreadMessages = [] } = useQuery<any[]>({
    queryKey: ["/api/messages/unread"],
    enabled: !!user,
  });
  
  const unreadCount = unreadMessages?.length || 0;
  
  const toggleMenu = (href: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [href]: !prev[href]
    }));
  };
  
  const navItems = [
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
  
  const getUserInitials = () => {
    if (!user?.fullName) return "U";
    
    const nameParts = user.fullName.split(" ");
    if (nameParts.length === 1) return nameParts[0][0].toUpperCase();
    
    return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
  };
  
  const closeMobileMenu = () => {
    if (setShowMobileMenu) {
      setShowMobileMenu(false);
    }
  };
  
  return (
    <aside className="flex flex-col h-full bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800">
      {/* User Info */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 border-2 border-primary">
            <AvatarImage src={user?.profilePicture || undefined} alt={user?.fullName || ""} />
            <AvatarFallback className="bg-primary text-white">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {user?.fullName}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {user?.role === "admin" ? "Administrator" : 
                user?.role === "it" ? "IT Support" : "Employee"}
            </p>
          </div>
        </div>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = location === item.href || 
              (item.submenu && item.submenu.some(subItem => location === subItem.href));
            const Icon = item.icon;
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isOpen = openMenus[item.href] || isActive;
            
            return (
              <li key={item.href} className="mb-1">
                {hasSubmenu ? (
                  <Collapsible open={isOpen} onOpenChange={(open) => setOpenMenus(prev => ({ ...prev, [item.href]: open }))}>
                    <CollapsibleTrigger asChild>
                      <button
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-md",
                          isActive
                            ? "text-primary dark:text-primary-light bg-neutral-100 dark:bg-neutral-800"
                            : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        )}
                      >
                        <span className="flex items-center">
                          <Icon className="h-5 w-5 mr-3" />
                          {item.label}
                        </span>
                        {item.badge && (
                          <Badge className="mx-2 bg-amber-500 hover:bg-amber-600">
                            {item.badge}
                          </Badge>
                        )}
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <ul className="pl-10 pr-2 mt-1 space-y-1">
                        {item.submenu.map((subItem) => {
                          const isSubActive = location === subItem.href;
                          return (
                            <li key={subItem.href}>
                              <Link href={subItem.href}>
                                <a
                                  className={cn(
                                    "block py-2 px-3 text-sm rounded-md",
                                    isSubActive
                                      ? "text-primary dark:text-primary-light bg-neutral-100 dark:bg-neutral-800"
                                      : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                  )}
                                  onClick={closeMobileMenu}
                                >
                                  {subItem.label}
                                </a>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <Link href={item.href}>
                    <a
                      className={cn(
                        "flex items-center px-4 py-3 text-sm font-medium rounded-md",
                        isActive
                          ? "text-primary dark:text-primary-light bg-neutral-100 dark:bg-neutral-800"
                          : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      )}
                      onClick={closeMobileMenu}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.label}
                      {item.badge && (
                        <Badge className="ml-auto bg-amber-500 hover:bg-amber-600">
                          {item.badge}
                        </Badge>
                      )}
                    </a>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Dark Mode Toggle */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 rounded-md">
          <span className="flex items-center">
            {theme === "dark" ? (
              <Moon className="h-5 w-5 mr-3" />
            ) : (
              <Sun className="h-5 w-5 mr-3" />
            )}
            <span className="dark:hidden">Dark Mode</span>
            <span className="hidden dark:inline">Light Mode</span>
          </span>
          <Switch
            checked={theme === "dark"}
            onCheckedChange={toggleTheme}
            aria-label="Toggle dark mode"
          />
        </div>
      </div>
    </aside>
  );
}
