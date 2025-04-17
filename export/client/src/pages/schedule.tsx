import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Route, Link, Switch } from "wouter";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { ShiftCalendar } from "@/components/schedule/shift-calendar";
import { ShiftForm } from "@/components/schedule/shift-form";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Shift, Venue, User } from "@shared/schema";
import { PlusCircle, Calendar, ListOrdered } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Schedule() {
  const [location, navigate] = useLocation();
  const [isCreateShiftOpen, setIsCreateShiftOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const { toast } = useToast();

  // Parse query parameters
  const query = new URLSearchParams(location.split("?")[1] || "");
  const shiftIdParam = query.get("shift");

  // Fetch shifts
  const { data: shifts = [] } = useQuery<Shift[]>({
    queryKey: ["/api/shifts"],
  });

  // Fetch venues
  const { data: venues = [] } = useQuery<Venue[]>({
    queryKey: ["/api/venues"],
  });

  // Fetch employees
  const { data: employees = [] } = useQuery<User[]>({
    queryKey: ["/api/users/employees"],
  });

  // Find shift if ID is in query params
  useState(() => {
    if (shiftIdParam) {
      const shift = shifts.find(s => s.id === Number(shiftIdParam));
      if (shift) {
        setSelectedShift(shift);
        setIsCreateShiftOpen(true);
      } else {
        toast({
          title: "Shift not found",
          description: `Could not find shift with ID ${shiftIdParam}`,
          variant: "destructive",
        });
      }
    }
  });

  const handleCreateShift = () => {
    setSelectedShift(null);
    setIsCreateShiftOpen(true);
  };

  const handleEditShift = (shift: Shift) => {
    setSelectedShift(shift);
    setIsCreateShiftOpen(true);
  };

  const handleCloseDialog = () => {
    setIsCreateShiftOpen(false);
    setSelectedShift(null);
    
    // Remove shift query param if it exists
    if (shiftIdParam) {
      navigate("/schedule");
    }
  };

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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                  Schedule
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Manage shifts and schedules
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center space-x-2">
                <Tabs 
                  value={viewMode} 
                  onValueChange={(value) => setViewMode(value as "calendar" | "list")}
                  className="mr-2"
                >
                  <TabsList>
                    <TabsTrigger value="calendar" className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Calendar</span>
                    </TabsTrigger>
                    <TabsTrigger value="list" className="flex items-center">
                      <ListOrdered className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">List</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <Button 
                  onClick={handleCreateShift} 
                  className="bg-primary hover:bg-primary-dark text-white shadow-sm"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  New Shift
                </Button>
              </div>
            </div>

            {/* Schedule Content */}
            <TabsContent value={viewMode} className="mt-0">
              <ShiftCalendar 
                shifts={shifts} 
                venues={venues}
                employees={employees}
                viewMode={viewMode}
                onEditShift={handleEditShift}
              />
            </TabsContent>
          </div>
        </main>
      </div>

      {/* Create/Edit Shift Dialog */}
      <Dialog open={isCreateShiftOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <ShiftForm 
            shift={selectedShift}
            venues={venues} 
            employees={employees}
            onClose={handleCloseDialog} 
          />
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation for Mobile */}
      <MobileNav />
    </div>
  );
}
