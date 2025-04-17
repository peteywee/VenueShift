import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Building2,
  Calendar,
  Clock,
  MessageSquare,
  Receipt,
  Settings,
  Camera,
  Smartphone,
  Lock,
  Database,
  Layers,
  MonitorSmartphone,
  CircleUser,
  Grid,
  Monitor
} from 'lucide-react';

export default function DemoDashboard() {
  // Define all demo pages with their details
  const demoPages = [
    {
      title: "Mobile Optimizations",
      description: "Camera access, photo gallery, device detection & optimizations",
      icon: <Smartphone className="h-6 w-6 text-primary" />,
      path: "/mobile-demo",
      badge: "New",
      badgeVariant: "default" as const
    },
    {
      title: "User Authentication",
      description: "Login, registration & user management",
      icon: <Lock className="h-6 w-6 text-orange-500" />,
      path: "/auth-demo",
      badge: "Core",
      badgeVariant: "outline" as const
    },
    {
      title: "Venues Management",
      description: "Create and manage locations",
      icon: <Building2 className="h-6 w-6 text-blue-500" />,
      path: "/venues-demo", 
      badge: "Admin",
      badgeVariant: "secondary" as const
    },
    {
      title: "Staff Management",
      description: "Employee profiles & roles",
      icon: <Users className="h-6 w-6 text-green-500" />,
      path: "/employees-demo",
      badge: "Admin",
      badgeVariant: "secondary" as const
    },
    {
      title: "Shift Scheduling",
      description: "Calendar view & shift creation",
      icon: <Calendar className="h-6 w-6 text-indigo-500" />,
      path: "/schedule-demo",
      badge: "Core",
      badgeVariant: "outline" as const
    },
    {
      title: "Time Tracking",
      description: "Clock in/out functionality",
      icon: <Clock className="h-6 w-6 text-purple-500" />,
      path: "/time-demo",
      badge: "Core",
      badgeVariant: "outline" as const
    },
    {
      title: "Messaging",
      description: "Staff communications & notifications",
      icon: <MessageSquare className="h-6 w-6 text-pink-500" />,
      path: "/messages-demo", 
      badge: "Core",
      badgeVariant: "outline" as const
    },
    {
      title: "Till Verification",
      description: "End of shift cash handling",
      icon: <Receipt className="h-6 w-6 text-yellow-500" />,
      path: "/till-demo",
      badge: "Core",
      badgeVariant: "outline" as const
    },
    {
      title: "User Profiles",
      description: "Profile editing & customization",
      icon: <CircleUser className="h-6 w-6 text-cyan-500" />,
      path: "/profile-demo",
      badge: "Core",
      badgeVariant: "outline" as const
    },
    {
      title: "Web Interface",
      description: "Desktop backup access point",
      icon: <Monitor className="h-6 w-6 text-gray-600" />,
      path: "/web-interface-demo",
      badge: "New",
      badgeVariant: "default" as const
    },
    {
      title: "Offline Support",
      description: "Work without internet connection",
      icon: <WifiOff className="h-6 w-6 text-red-500" />,
      path: "/offline-demo",
      badge: "Mobile",
      badgeVariant: "destructive" as const
    },
    {
      title: "API Access",
      description: "Data endpoints & integration",
      icon: <Database className="h-6 w-6 text-gray-500" />,
      path: "/api-demo",
      badge: "Developer",
      badgeVariant: "secondary" as const
    },
    {
      title: "Add-ons & Extensions",
      description: "Additional functionality modules",
      icon: <Grid className="h-6 w-6 text-violet-500" />,
      path: "/add-ons",
      badge: "Premium",
      badgeVariant: "default" as const
    }
  ];

  return (
    <div className="container py-8 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Staff Management Platform Demo</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Explore the features of our comprehensive staff management solution for non-profit organizations
        </p>
      </div>

      <div className="flex flex-wrap gap-6 items-center justify-center mb-8">
        <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 text-sm">
          <MonitorSmartphone className="h-3.5 w-3.5" />
          <span>Mobile-First Design</span>
        </Badge>

        <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 text-sm">
          <Layers className="h-3.5 w-3.5" />
          <span>React + TypeScript</span>
        </Badge>

        <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 text-sm">
          <Settings className="h-3.5 w-3.5" />
          <span>Customizable</span>
        </Badge>

        <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 text-sm">
          <WifiOff className="h-3.5 w-3.5" />
          <span>Offline Support</span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {demoPages.map((page, index) => (
          <Link key={index} href={page.path}>
            <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="p-2 rounded-md bg-muted">
                    {page.icon}
                  </div>
                  {page.badge && (
                    <Badge variant={page.badgeVariant}>
                      {page.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="mt-4">{page.title}</CardTitle>
                <CardDescription>{page.description}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-2">
                <Button variant="outline" className="w-full">
                  Explore Demo
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-xl font-semibold mb-4">Mobile-Optimized Application</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
          Our platform is designed with modern mobile devices in mind, offering full functionality
          whether you're at a desktop or on the go with your smartphone or tablet.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button size="lg" className="gap-2" asChild>
            <Link href="/mobile-demo">
              <Camera className="h-5 w-5" />
              <span>Try Mobile Features</span>
            </Link>
          </Button>

          <Button size="lg" variant="outline" className="gap-2" asChild>
            <Link href="/auth">
              <Lock className="h-5 w-5" />
              <span>Auth Demo</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Make sure the WifiOff icon is imported
import { WifiOff } from 'lucide-react';