import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  Building2,
  UserRound,
  Calendar,
  Clock,
  MessageSquare,
  Receipt,
  ChevronRight,
  Monitor,
  Smartphone,
  Bell,
  Settings,
  LogOut
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { InterfaceToggle } from '@/components/interface-toggle';

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();

  // Handle switching to web interface
  const switchToWebInterface = () => {
    localStorage.setItem("useWebInterface", JSON.stringify(true));
    window.location.reload();
  };

  // Demo menu cards
  const menuCards = [
    {
      title: 'Venues',
      description: 'Manage location details',
      icon: Building2,
      href: '/venues',
      badge: '4'
    },
    {
      title: 'Staff',
      description: 'Manage employees',
      icon: UserRound,
      href: '/employees',
      badge: '12'
    },
    {
      title: 'Schedule',
      description: 'View & create shifts',
      icon: Calendar,
      href: '/schedule',
      badge: 'New'
    },
    {
      title: 'Time Tracking',
      description: 'Clock in/out',
      icon: Clock,
      href: '/timetracking'
    },
    {
      title: 'Messages',
      description: 'Team communication',
      icon: MessageSquare,
      href: '/messages',
      badge: '3'
    },
    {
      title: 'Till Verification',
      description: 'End of shift counts',
      icon: Receipt,
      href: '/till-verification'
    },
  ];

  return (
    <div className="container py-4 px-4 md:px-6 space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          <h1 className="text-xl font-bold">Staff Manager</h1>
        </div>
        <div className="flex items-center gap-2">
          <InterfaceToggle currentInterface="mobile" className="mr-1" />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.profilePicture || undefined} />
                  <AvatarFallback>
                    {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarFallback>{user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <span>{user?.fullName || 'User'}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserRound className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logoutMutation.mutate()} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Welcome Card */}
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle>Welcome, {user?.fullName || 'User'}</CardTitle>
          <CardDescription>
            Mobile interface for venue &amp; staff management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-sm text-muted-foreground">You have 3 unread messages</p>
            </div>
            <Button variant="outline" size="sm" className="gap-1" asChild>
              <Link href="/messages">
                <span>Inbox</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Web interface card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" />
            <CardTitle>Web Interface Available</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Need more screen space? Switch to the web interface for an expanded dashboard 
            with additional features and visualization tools.
          </CardDescription>
        </CardContent>
        <CardFooter>
          <Button onClick={switchToWebInterface} className="w-full gap-2">
            <Monitor className="h-4 w-4" />
            <span>Use Web Interface</span>
          </Button>
        </CardFooter>
      </Card>

      {/* Menu Cards */}
      <div className="grid grid-cols-2 gap-4">
        {menuCards.map((card, index) => (
          <Link key={index} href={card.href}>
            <Card className="h-full cursor-pointer hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="p-2 rounded-md bg-primary/10">
                    <card.icon className="h-5 w-5 text-primary" />
                  </div>
                  {card.badge && (
                    <Badge variant="outline" className="ml-auto">
                      {card.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-base mt-2">{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="pb-4 pt-0">
                <CardDescription>{card.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* App version */}
      <div className="text-center text-xs text-muted-foreground">
        <p>Staff Management App v1.0</p>
        <p>Mobile Interface</p>
      </div>
    </div>
  );
}