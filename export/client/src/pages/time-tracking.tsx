import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ClockInOut } from "@/components/time-tracking/clock-in-out";
import { TimeLog } from "@/components/time-tracking/time-log";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shift, User } from "@shared/schema";
import { formatDate } from "@/lib/utils/date-utils";

export default function TimeTracking() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Format date for API query
  const formattedDate = formatDate(selectedDate);
  
  // Fetch employee shifts for today
  const { data: shifts = [] } = useQuery<Shift[]>({
    queryKey: [`/api/shifts?employeeId=${user?.id}`],
    enabled: !!user,
  });
  
  // Fetch time entries
  const { data: timeEntries = [] } = useQuery({
    queryKey: [`/api/time-entries?employeeId=${user?.id}`],
    enabled: !!user,
  });
  
  // Fetch all employees (for admin view)
  const { data: employees = [] } = useQuery<User[]>({
    queryKey: ["/api/users/employees"],
    enabled: user?.role === "admin" || user?.role === "it",
  });
  
  // Determine active shifts (shifts for today that haven't ended yet)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const activeShifts = shifts.filter(shift => {
    const shiftStartTime = new Date(shift.startTime);
    const shiftEndTime = new Date(shift.endTime);
    const now = new Date();
    
    return shiftEndTime > now && shiftStartTime.getDate() === now.getDate();
  });
  
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <Header />

      {/* Main Content Area */}
      <div className="pt-16 pb-16 lg:pl-64 min-h-screen flex flex-col">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 z-10">
          <Sidebar />
        </div>

        {/* Page Content */}
        <main className="flex-1 px-4 py-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                Time Tracking
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Track your work hours and view your time logs
              </p>
            </div>

            {/* Time Tracking Tabs */}
            <Tabs defaultValue="clock" className="space-y-6">
              <TabsList>
                <TabsTrigger value="clock">Clock In/Out</TabsTrigger>
                <TabsTrigger value="logs">Time Logs</TabsTrigger>
                {(user?.role === "admin" || user?.role === "it") && (
                  <TabsTrigger value="admin">Admin View</TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="clock" className="space-y-6">
                <ClockInOut 
                  activeShifts={activeShifts}
                  timeEntries={timeEntries}
                />
              </TabsContent>
              
              <TabsContent value="logs">
                <TimeLog 
                  timeEntries={timeEntries} 
                  shifts={shifts}
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  isAdminView={false}
                />
              </TabsContent>
              
              {(user?.role === "admin" || user?.role === "it") && (
                <TabsContent value="admin">
                  <TimeLog 
                    timeEntries={timeEntries} 
                    shifts={shifts}
                    employees={employees}
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    isAdminView={true}
                  />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </main>
      </div>

      {/* Bottom Navigation for Mobile */}
      <MobileNav />
    </div>
  );
}
