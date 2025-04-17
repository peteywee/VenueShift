import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Building2,
  ChevronDown,
  Users,
  Calendar,
  ClipboardCheck,
  Receipt,
  MessageSquare,
  Clock,
  LayoutDashboard,
  BarChart3,
  Settings,
  HelpCircle,
  Grid,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';

export function WebSidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/web",
    },
    {
      title: "Venues",
      icon: <Building2 className="h-5 w-5" />,
      href: "/web/venues",
    },
    {
      title: "Staff",
      icon: <Users className="h-5 w-5" />,
      href: "/web/employees",
    },
    {
      title: "Schedule",
      icon: <Calendar className="h-5 w-5" />,
      href: "/web/schedule",
    },
    {
      title: "Time Tracking",
      icon: <Clock className="h-5 w-5" />,
      href: "/web/timetracking",
    },
    {
      title: "Messaging",
      icon: <MessageSquare className="h-5 w-5" />,
      href: "/web/messages",
    },
    {
      title: "Till Verification",
      icon: <Receipt className="h-5 w-5" />,
      href: "/web/till-verification",
    },
    {
      title: "Add-ons",
      icon: <Grid className="h-5 w-5" />,
      href: "/web/add-ons",
    },
  ];
  
  return (
    <div className="flex h-full flex-col border-r">
      {/* Sidebar header with logo */}
      <div className="flex h-16 items-center gap-2 border-b px-4 lg:px-6">
        <div className="bg-primary size-8 rounded-md grid place-items-center text-primary-foreground font-bold">
          SM
        </div>
        <Link href="/web" className="font-semibold">Staff Manager</Link>
      </div>
      
      {/* Sidebar content */}
      <ScrollArea className="flex-1">
        <div className="px-3 py-4">
          <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground">
            DASHBOARD
          </h2>
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Button
                key={item.href}
                variant={location === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2",
                  location === item.href && "bg-primary/10"
                )}
                asChild
              >
                <Link href={item.href}>
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </Button>
            ))}
          </div>
          
          <h2 className="mb-2 mt-6 px-4 text-xs font-semibold tracking-tight text-muted-foreground">
            SYSTEM
          </h2>
          
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              asChild
            >
              <Link href="/web/reports">
                <BarChart3 className="h-5 w-5" />
                <span>Reports</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              asChild
            >
              <Link href="/web/settings">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              asChild
            >
              <Link href="/web/help">
                <HelpCircle className="h-5 w-5" />
                <span>Help & Support</span>
              </Link>
            </Button>
          </div>
        </div>
      </ScrollArea>
      
      {/* User info */}
      <div className="mt-auto p-4 border-t">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user?.profilePicture || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium truncate">{user?.fullName || 'User'}</span>
            <span className="text-xs text-muted-foreground truncate">{user?.email || 'user@example.com'}</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-auto"
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Log out</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}