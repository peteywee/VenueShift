import React from 'react';
import { Link } from 'wouter';
import { WebLayout } from '@/components/web-interface/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header';
import { useAuth } from '@/hooks/use-auth';
import {
  Building2,
  User,
  Calendar,
  Clock,
  MessageSquare,
  Receipt,
  BarChart3,
  Smartphone,
  ArrowRight,
  Activity,
  UserCheck,
  Users,
  Landmark
} from 'lucide-react';

export default function WebDashboard() {
  const { user } = useAuth();
  
  // Example stats data
  const stats = [
    { label: 'Active Venues', value: 4, icon: Building2, color: 'bg-blue-500' },
    { label: 'Employees', value: 12, icon: User, color: 'bg-green-500' },
    { label: 'Shifts This Week', value: 28, icon: Calendar, color: 'bg-purple-500' },
    { label: 'Pending Approvals', value: 3, icon: Clock, color: 'bg-yellow-500' }
  ];

  // Example activity feed
  const activityFeed = [
    { 
      user: 'Jane Doe', 
      action: 'clocked in', 
      target: 'Main Street Arts Center', 
      time: '30 minutes ago',
      icon: UserCheck
    },
    { 
      user: 'Robert Johnson', 
      action: 'updated schedule for', 
      target: 'Westside Community Hall', 
      time: '2 hours ago',
      icon: Calendar
    },
    { 
      user: 'Maria Garcia', 
      action: 'submitted till verification for', 
      target: 'Harbor View Conference Center', 
      time: '4 hours ago',
      icon: Receipt
    },
    { 
      user: 'Michael Brown', 
      action: 'created a new announcement', 
      target: 'all staff', 
      time: 'Yesterday',
      icon: MessageSquare
    }
  ];

  // Quick action cards
  const quickActions = [
    { 
      title: 'Create Shift', 
      description: 'Schedule a new shift for an employee', 
      icon: Calendar, 
      href: '/web/schedule/create' 
    },
    { 
      title: 'Add Employee', 
      description: 'Onboard a new staff member', 
      icon: User, 
      href: '/web/employees/add' 
    },
    { 
      title: 'Verify Till', 
      description: 'Confirm end-of-day cash count', 
      icon: Receipt, 
      href: '/web/till-verification' 
    },
    { 
      title: 'Send Message', 
      description: 'Communicate with your team', 
      icon: MessageSquare, 
      href: '/web/messages' 
    }
  ];

  return (
    <WebLayout>
      <PageHeader>
        <PageHeaderHeading>
          Welcome back, {user?.fullName || 'Administrator'}
        </PageHeaderHeading>
        <PageHeaderDescription>
          Manage your venues and staff from this web dashboard
        </PageHeaderDescription>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${stat.color} bg-opacity-20`}>
                  <stat.icon className={`h-6 w-6 ${stat.color} text-white`} />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Quick actions */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action, i) => (
              <Card key={i}>
                <CardHeader className="p-4">
                  <div className="flex items-center gap-2">
                    <action.icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <CardDescription>{action.description}</CardDescription>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button asChild variant="ghost" className="gap-1">
                    <Link href={action.href}>
                      Go <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Switch to mobile interface */}
          <Card className="mt-6">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                <CardTitle>Mobile Interface</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Need to use the mobile-optimized interface? Switch to the mobile view for a touch-friendly experience, 
                designed for use on smartphones and tablets.
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="gap-2" onClick={() => {
                localStorage.setItem("useWebInterface", JSON.stringify(false));
                window.location.reload();
              }}>
                <Smartphone className="h-4 w-4" />
                <span>Switch to Mobile Interface</span>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Activity feed */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <Button variant="ghost" size="sm">View all</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="flex flex-col divide-y">
                {activityFeed.map((activity, i) => (
                  <div key={i} className="p-4 flex items-start gap-4">
                    <div className="mt-1 p-2 rounded-full bg-primary/10">
                      <activity.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>
                        {" "}{activity.action}{" "}
                        <span className="font-medium">{activity.target}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Finance Summary Card */}
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Financial Summary</CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="gap-1">
                  <span>Reports</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Today's Revenue</span>
                  <span className="font-medium">$1,250.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Week to Date</span>
                  <span className="font-medium">$5,680.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Month to Date</span>
                  <span className="font-medium">$24,320.00</span>
                </div>
                <div className="h-[120px] w-full mt-2">
                  {/* Simple chart placeholder */}
                  <div className="w-full h-full bg-muted/30 relative rounded-md overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 flex h-full items-end">
                      <div className="w-1/7 h-[30%] bg-primary/40 mx-0.5"></div>
                      <div className="w-1/7 h-[45%] bg-primary/40 mx-0.5"></div>
                      <div className="w-1/7 h-[60%] bg-primary/40 mx-0.5"></div>
                      <div className="w-1/7 h-[75%] bg-primary/40 mx-0.5"></div>
                      <div className="w-1/7 h-[55%] bg-primary/40 mx-0.5"></div>
                      <div className="w-1/7 h-[80%] bg-primary/40 mx-0.5"></div>
                      <div className="w-1/7 h-[70%] bg-primary/40 mx-0.5"></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </WebLayout>
  );
}