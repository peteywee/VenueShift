import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shift, User, Venue } from "@shared/schema";
import { ChevronLeft, ChevronRight, Calendar, Trash2, Pencil } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  addWeeks, 
  subWeeks, 
  eachDayOfInterval, 
  isSameDay 
} from "date-fns";
import { formatTime, calculateDuration } from "@/lib/utils/date-utils";

interface ShiftCalendarProps {
  shifts: Shift[];
  venues: Venue[];
  employees: User[];
  viewMode: "calendar" | "list";
  onEditShift: (shift: Shift) => void;
}

export function ShiftCalendar({ shifts, venues, employees, viewMode, onEditShift }: ShiftCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { toast } = useToast();
  
  // Calculate week range
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start from Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 }); // End on Sunday
  
  // Generate array of dates for the week
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  // Get next week
  const goToNextWeek = () => {
    setCurrentDate(prev => addWeeks(prev, 1));
  };
  
  // Get previous week
  const goToPreviousWeek = () => {
    setCurrentDate(prev => subWeeks(prev, 1));
  };
  
  // Get shifts for a specific day
  const getShiftsForDay = (date: Date) => {
    return shifts.filter(shift => {
      const shiftDate = new Date(shift.startTime);
      return isSameDay(shiftDate, date);
    });
  };
  
  // Delete shift mutation
  const deleteMutation = useMutation({
    mutationFn: async (shiftId: number) => {
      await apiRequest("DELETE", `/api/shifts/${shiftId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
      toast({
        title: "Shift deleted",
        description: "The shift has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete shift",
        variant: "destructive",
      });
    },
  });
  
  // Handle shift deletion
  const handleDeleteShift = (shiftId: number) => {
    if (window.confirm("Are you sure you want to delete this shift?")) {
      deleteMutation.mutate(shiftId);
    }
  };
  
  // Helper functions
  const getVenueName = (venueId: number) => {
    const venue = venues.find(v => v.id === venueId);
    return venue?.name || "Unknown Venue";
  };
  
  const getEmployee = (employeeId?: number) => {
    if (!employeeId) return null;
    return employees.find(e => e.id === employeeId);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Confirmed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Render calendar view
  const renderCalendarView = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToPreviousWeek}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <h3 className="text-lg font-medium">
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
          </h3>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToNextWeek}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {/* Day Headers */}
          {weekDays.map((day, index) => (
            <div 
              key={index} 
              className="p-2 text-center font-medium bg-neutral-100 dark:bg-neutral-800 rounded-t-md"
            >
              <div className="text-neutral-600 dark:text-neutral-400 text-xs">
                {format(day, "EEE")}
              </div>
              <div className="text-lg">{format(day, "d")}</div>
            </div>
          ))}
          
          {/* Calendar Cells */}
          {weekDays.map((day, dayIndex) => {
            const dayShifts = getShiftsForDay(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div 
                key={dayIndex} 
                className={`min-h-[150px] p-1 rounded-b-md overflow-y-auto border ${
                  isToday 
                    ? "border-primary" 
                    : "border-neutral-200 dark:border-neutral-800"
                }`}
              >
                {dayShifts.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-neutral-400 dark:text-neutral-600 text-sm">
                    No shifts
                  </div>
                ) : (
                  <div className="space-y-1">
                    {dayShifts.map((shift) => {
                      const employee = getEmployee(shift.employeeId);
                      
                      return (
                        <div 
                          key={shift.id} 
                          className={`p-2 rounded-md text-xs cursor-pointer ${
                            shift.status === "confirmed" 
                              ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200" 
                              : shift.status === "pending"
                                ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200"
                                : shift.status === "cancelled"
                                  ? "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200"
                                  : "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
                          }`}
                          onClick={() => onEditShift(shift)}
                        >
                          <div className="font-medium">{getVenueName(shift.venueId)}</div>
                          <div className="flex justify-between items-center">
                            <div>
                              {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                            </div>
                            {employee && (
                              <div className="text-xs opacity-80 truncate max-w-[100px]">
                                {employee.fullName}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Render list view
  const renderListView = () => {
    const sortedShifts = [...shifts].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    
    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedShifts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-neutral-500 dark:text-neutral-400">
                      <Calendar className="h-10 w-10 mb-2 opacity-50" />
                      <p>No shifts scheduled</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedShifts.map((shift) => {
                  const employee = getEmployee(shift.employeeId);
                  const shiftDate = new Date(shift.startTime);
                  
                  return (
                    <TableRow key={shift.id}>
                      <TableCell>
                        <div className="font-medium">{format(shiftDate, "EEE, MMM d, yyyy")}</div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          {calculateDuration(shift.startTime, shift.endTime)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{getVenueName(shift.venueId)}</div>
                        {shift.title && (
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">
                            {shift.title}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {employee ? (
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage src={employee.profilePicture} alt={employee.fullName} />
                              <AvatarFallback className="text-xs">
                                {employee.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>{employee.fullName}</div>
                          </div>
                        ) : (
                          <div className="text-neutral-500 dark:text-neutral-400 italic">
                            Unassigned
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(shift.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditShift(shift)}
                            className="mr-1"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteShift(shift.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };
  
  return viewMode === "calendar" ? renderCalendarView() : renderListView();
}
