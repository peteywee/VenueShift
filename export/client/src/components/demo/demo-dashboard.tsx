import { useState } from "react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PayInformation } from "@/components/dashboard/pay-information";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, CheckCircle, Clock, DollarSign, MapPin, MessageSquare, Users } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";
import { demoUsers, demoVenues, demoShifts, demoMessages, demoTimeEntries, demoTillVerifications } from "@/lib/demo-data";

export function DemoDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const currentUser = demoUsers[0]; // Admin user
  
  // Count active employees, venues, today's shifts
  const activeEmployees = demoUsers.filter(user => user.role !== "admin" && user.role !== "it").length;
  const activeVenues = demoVenues.length;
  
  // Filter for today's shifts
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const todayShifts = demoShifts.filter(shift => {
    const shiftDate = new Date(shift.startTime);
    return shiftDate >= today && shiftDate < tomorrow;
  });
  
  // Calculate clock-in stats
  const todayTimeEntries = demoTimeEntries.filter(entry => {
    const entryDate = new Date(entry.clockIn);
    return entryDate >= today && entryDate < tomorrow;
  });
  
  const clockedInEmployees = new Set(todayTimeEntries.map(entry => entry.employeeId));
  const assignedEmployees = new Set(todayShifts.filter(shift => shift.employeeId).map(shift => shift.employeeId));
  const clockInCount = clockedInEmployees.size;
  const expectedCount = assignedEmployees.size;
  
  // Recent messages
  const recentMessages = [...demoMessages]
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
    .slice(0, 3);
  
  // Upcoming shifts
  const upcomingShifts = [...demoShifts]
    .filter(shift => new Date(shift.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 4);
  
  // Format date for display
  const formatDate = (date: string) => {
    return format(new Date(date), "MMM d, yyyy");
  };

  // Format time for display
  const formatTime = (date: string) => {
    return format(new Date(date), "h:mm a");
  };
  
  // Get user by ID
  const getUserById = (userId?: number) => {
    return userId ? demoUsers.find(user => user.id === userId) : undefined;
  };
  
  // Get venue by ID
  const getVenueById = (venueId?: number) => {
    return venueId ? demoVenues.find(venue => venue.id === venueId) : undefined;
  };
  
  // Get shift by ID
  const getShiftById = (shiftId?: number) => {
    return shiftId ? demoShifts.find(shift => shift.id === shiftId) : undefined;
  };
  
  // Generate week days for calendar
  const generateWeekDays = () => {
    const startDate = startOfWeek(new Date());
    return Array.from({ length: 7 }).map((_, index) => {
      const date = addDays(startDate, index);
      return {
        date,
        dayName: format(date, "EEE"),
        dayNumber: format(date, "d"),
        shifts: demoShifts.filter(shift => {
          const shiftDate = new Date(shift.startTime);
          return format(shiftDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
        })
      };
    });
  };
  
  // Weekly calendar data
  const weekDays = generateWeekDays();
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="till">Till Verification</TabsTrigger>
        </TabsList>
        
        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Active Employees"
              value={activeEmployees}
              change={{
                value: "+1",
                trend: "up",
                text: "from last month"
              }}
              icon={Users}
              iconColor="text-primary"
            />
            
            <StatsCard
              title="Active Venues"
              value={activeVenues}
              change={{
                value: "",
                trend: "neutral",
                text: "No change from last month"
              }}
              icon={MapPin}
              iconColor="text-secondary"
            />
            
            <StatsCard
              title="Today's Shifts"
              value={todayShifts.length}
              change={{
                value: "",
                trend: "neutral",
                text: "1 starting in 30 minutes"
              }}
              icon={Calendar}
              iconColor="text-amber-500"
            />
            
            <StatsCard
              title="Clock-ins Today"
              value={`${clockInCount}/${expectedCount}`}
              progress={{
                value: clockInCount,
                total: expectedCount || 1
              }}
              icon={CheckCircle}
              iconColor="text-green-500"
            />
          </div>
          
          {/* Upcoming Shifts */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Upcoming Shifts
              </CardTitle>
              <CardDescription>
                View your scheduled shifts for the next few days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {upcomingShifts.map((shift, index) => {
                  const employee = getUserById(shift.employeeId!);
                  const venue = getVenueById(shift.venueId);
                  
                  return (
                    <div key={index} className="py-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div className="ml-4">
                          <p className="font-medium">{shift.title}</p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {employee?.fullName} • {venue?.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatDate(shift.startTime)}</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          {/* Pay Information */}
          <PayInformation />
        </TabsContent>
        
        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Weekly Schedule
              </CardTitle>
              <CardDescription>
                Staff schedule for the current week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, index) => (
                  <div key={index} className="text-center">
                    <div className="mb-2">
                      <p className="text-sm font-medium">{day.dayName}</p>
                      <p className="text-2xl font-bold">{day.dayNumber}</p>
                    </div>
                    <div className="space-y-2">
                      {day.shifts.map((shift, shiftIndex) => {
                        const employee = getUserById(shift.employeeId!);
                        return (
                          <div 
                            key={shiftIndex} 
                            className="bg-primary/10 p-2 rounded-md text-left text-xs"
                          >
                            <p className="font-medium truncate">{shift.title}</p>
                            <p className="truncate">{employee?.fullName}</p>
                            <p className="text-neutral-500 dark:text-neutral-400">
                              {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                            </p>
                          </div>
                        );
                      })}
                      {day.shifts.length === 0 && (
                        <div className="h-20 border border-dashed border-neutral-200 dark:border-neutral-700 rounded-md flex items-center justify-center">
                          <p className="text-xs text-neutral-400 dark:text-neutral-500">No shifts</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  Staff Availability
                </CardTitle>
                <CardDescription>
                  Team members available for scheduling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demoUsers.filter(user => user.role !== "admin").map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.profilePicture} alt={user.fullName} />
                          <AvatarFallback className="bg-primary text-white">
                            {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <p className="font-medium">{user.fullName}</p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={index % 2 === 0 ? "success" : index % 3 === 0 ? "destructive" : "secondary"}>
                        {index % 2 === 0 ? "Available" : index % 3 === 0 ? "Time Off" : "Limited"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  Time Tracking
                </CardTitle>
                <CardDescription>
                  Current clock-ins and recent activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800">
                    <h3 className="font-semibold text-green-800 dark:text-green-300">Active Clock-ins</h3>
                    {todayTimeEntries.map((entry, index) => {
                      const employee = getUserById(entry.employeeId);
                      return (
                        <div key={index} className="mt-3 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="ml-3">
                              <p className="font-medium">{employee?.fullName}</p>
                              <p className="text-xs text-green-700 dark:text-green-300">
                                Clocked in at {formatTime(entry.clockIn)}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-700">
                            Active
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Recent Time Entries</h3>
                    <div className="space-y-3">
                      {demoTimeEntries
                        .filter(entry => entry.clockOut !== null)
                        .slice(0, 3)
                        .map((entry, index) => {
                          const employee = getUserById(entry.employeeId);
                          return (
                            <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={employee?.profilePicture} alt={employee?.fullName} />
                                  <AvatarFallback className="bg-primary text-white">
                                    {employee?.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="ml-2">
                                  <p className="font-medium text-sm">{employee?.fullName}</p>
                                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    {formatDate(entry.clockIn)} • {(entry as any).totalHours || 8.0} hrs
                                  </p>
                                </div>
                              </div>
                              <div className="text-right text-xs">
                                <p>{formatTime(entry.clockIn)} - {formatTime(entry.clockOut!)}</p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                Team Messages
              </CardTitle>
              <CardDescription>
                Communication with your team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 min-h-[400px]">
                {/* Conversations List */}
                <div className="md:w-1/3 border rounded-md">
                  <div className="p-3 border-b font-medium">
                    Recent Conversations
                  </div>
                  <div className="divide-y">
                    <div className="p-3 bg-primary/10 cursor-pointer">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-light text-white flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium">Announcements</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              Today
                            </p>
                          </div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-300 truncate">
                            Important: New health and safety protocols...
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {demoUsers.slice(1, 4).map((user, index) => (
                      <div key={index} className="p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.profilePicture} alt={user.fullName} />
                            <AvatarFallback className="bg-primary text-white">
                              {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-3 flex-1 min-w-0">
                            <div className="flex justify-between">
                              <p className="text-sm font-medium">{user.fullName}</p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {index === 0 ? '2h ago' : index === 1 ? 'Yesterday' : '3d ago'}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <p className="text-sm text-neutral-600 dark:text-neutral-300 truncate flex-1">
                                {index === 0 
                                  ? "Perfect, thank you! Also, we need to..."
                                  : index === 1 
                                    ? "The new equipment for the West Side location..."
                                    : "I've talked to Emily and she's available..."
                                }
                              </p>
                              {index === 0 && (
                                <Badge className="ml-2 bg-accent text-white">1</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Message Content */}
                <div className="md:w-2/3 border rounded-md flex flex-col">
                  <div className="p-3 border-b flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary-light text-white flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">Announcements</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        All staff announcements
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {demoMessages.filter(msg => msg.receiverId === null).map((message, index) => {
                      const sender = getUserById(message.senderId);
                      return (
                        <div key={index} className="flex flex-col">
                          <div className="flex items-start mb-1">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage src={sender?.profilePicture} alt={sender?.fullName} />
                              <AvatarFallback className="bg-primary text-white">
                                {sender?.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center">
                                <p className="font-medium text-sm">{sender?.fullName}</p>
                                <p className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">
                                  {formatDate(message.sentAt)}
                                </p>
                              </div>
                              <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg mt-1">
                                <p className="text-sm">{message.content}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="p-3 border-t">
                    <div className="flex items-center">
                      <input 
                        type="text" 
                        placeholder="Type a message..."
                        className="flex-1 p-2 border rounded-md mr-2 bg-background"
                      />
                      <Button>Send</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Till Verification Tab */}
        <TabsContent value="till" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-primary" />
                Till Verification
              </CardTitle>
              <CardDescription>
                End-of-shift cash register reconciliation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4 justify-between items-center">
                  <div className="flex items-center">
                    <Button variant="outline" className="mr-2">New Verification</Button>
                    <Button variant="outline">Export Records</Button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span>Verified</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                      <span>Pending</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span>Flagged</span>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md border overflow-hidden">
                  <div className="bg-neutral-100 dark:bg-neutral-800 p-3 font-medium grid grid-cols-7 text-sm">
                    <div>Date</div>
                    <div>Employee</div>
                    <div>Venue</div>
                    <div>Expected</div>
                    <div>Actual</div>
                    <div>Discrepancy</div>
                    <div className="text-right">Status</div>
                  </div>
                  <div className="divide-y">
                    {demoTillVerifications.map((verification, index) => {
                      const employee = getUserById(verification.employeeId);
                      // Find the venue - use venueId directly if available, otherwise try to find from the shift
                      let venue = verification.venueId ? getVenueById(verification.venueId) : undefined;
                      if (!venue && verification.shiftId) {
                        const shift = getShiftById(verification.shiftId);
                        if (shift) {
                          venue = getVenueById(shift.venueId);
                        }
                      }
                      
                      return (
                        <div key={index} className="p-3 grid grid-cols-7 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900">
                          <div>{formatDate(verification.verifiedAt || verification.createdAt || '')}</div>
                          <div>{employee?.fullName}</div>
                          <div>{venue?.name}</div>
                          <div>${(verification.expectedAmount / 100).toFixed(2)}</div>
                          <div>${(verification.actualAmount / 100).toFixed(2)}</div>
                          <div className={
                            verification.discrepancy && verification.discrepancy > 0 
                              ? "text-green-600 dark:text-green-400" 
                              : verification.discrepancy && verification.discrepancy < 0 
                                ? "text-red-600 dark:text-red-400" 
                                : ""
                          }>
                            {verification.discrepancy && verification.discrepancy > 0 ? "+" : ""}${(verification.discrepancy ? verification.discrepancy / 100 : 0).toFixed(2)}
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={
                                verification.status === "verified" 
                                  ? "default" 
                                  : verification.status === "flagged" 
                                    ? "destructive" 
                                    : "outline"
                              }
                            >
                              {verification.status && verification.status.charAt(0).toUpperCase() + verification.status.slice(1) || "Unknown"}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg border">
                  <h3 className="font-medium mb-3">Current Till Snapshot</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-neutral-800 rounded-lg p-3 shadow-sm">
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Downtown Center</p>
                      <p className="text-xl font-semibold">$275.50</p>
                      <div className="mt-1 flex items-center justify-between">
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Starting: $200.00</p>
                        <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Active</Badge>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-neutral-800 rounded-lg p-3 shadow-sm">
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">West Side Location</p>
                      <p className="text-xl font-semibold">$312.25</p>
                      <div className="mt-1 flex items-center justify-between">
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Starting: $200.00</p>
                        <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Active</Badge>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-neutral-800 rounded-lg p-3 shadow-sm">
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">East Branch</p>
                      <p className="text-xl font-semibold">$200.00</p>
                      <div className="mt-1 flex items-center justify-between">
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Starting: $200.00</p>
                        <Badge variant="outline" className="bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200">Ready</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}