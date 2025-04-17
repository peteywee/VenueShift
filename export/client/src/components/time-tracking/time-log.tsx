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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Shift, TimeEntry, User } from "@shared/schema";
import { CalendarIcon, Clock, ClockIcon, CheckCircle, XCircle, MapPin } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  format, 
  isToday,
  startOfDay,
  endOfDay,
  addDays,
  subDays,
  formatDistance
} from "date-fns";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils/date-utils";

interface TimeLogProps {
  timeEntries: TimeEntry[];
  shifts: Shift[];
  employees?: User[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  isAdminView: boolean;
}

export function TimeLog({ 
  timeEntries, 
  shifts, 
  employees = [],
  selectedDate,
  onDateChange,
  isAdminView 
}: TimeLogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  
  // Set current user as selected employee in non-admin view
  useEffect(() => {
    if (!isAdminView && user) {
      setSelectedEmployee(user.id);
    }
  }, [isAdminView, user]);
  
  // Filter time entries based on selected date and employee
  const filteredTimeEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.clockIn);
    const dateMatch = 
      entryDate >= startOfDay(selectedDate) && 
      entryDate <= endOfDay(selectedDate);
    
    const employeeMatch = selectedEmployee 
      ? entry.employeeId === selectedEmployee 
      : true;
    
    return dateMatch && employeeMatch;
  });
  
  // Get shift details by ID
  const getShiftById = (shiftId: number) => {
    return shifts.find(shift => shift.id === shiftId);
  };
  
  // Get employee details by ID
  const getEmployeeById = (employeeId: number) => {
    return employees.find(emp => emp.id === employeeId);
  };
  
  // Verify time entry mutation
  const verifyMutation = useMutation({
    mutationFn: async ({ timeEntryId, verified }: { timeEntryId: number, verified: boolean }) => {
      const res = await apiRequest("PATCH", `/api/time-entries/${timeEntryId}`, { verified });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
      toast({
        title: "Time entry updated",
        description: "The time entry has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update time entry",
        variant: "destructive",
      });
    },
  });
  
  // Handle verification toggle
  const handleVerifyToggle = (timeEntryId: number, currentStatus: boolean) => {
    verifyMutation.mutate({ timeEntryId, verified: !currentStatus });
  };
  
  // Date navigation
  const goToPreviousDay = () => {
    onDateChange(subDays(selectedDate, 1));
  };
  
  const goToNextDay = () => {
    onDateChange(addDays(selectedDate, 1));
  };
  
  const goToToday = () => {
    onDateChange(new Date());
  };
  
  // Calculate duration between clock in and clock out
  const calculateEntryDuration = (clockIn: string | Date, clockOut?: string | Date) => {
    const startTime = new Date(clockIn);
    
    if (!clockOut) {
      return "Not clocked out";
    }
    
    const endTime = new Date(clockOut);
    return formatDistance(endTime, startTime);
  };
  
  // Get location description
  const getLocationDescription = (coordinates: any) => {
    if (!coordinates) return "No location data";
    
    const hasClockIn = coordinates.clockInLocation;
    const hasClockOut = coordinates.clockOutLocation;
    
    if (hasClockIn && hasClockOut) {
      return "Location verified for both clock in and out";
    } else if (hasClockIn) {
      return "Location verified for clock in only";
    } else if (hasClockOut) {
      return "Location verified for clock out only";
    }
    
    return "No location data";
  };
  
  return (
    <div className="space-y-6">
      {/* Date and Employee Filters */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToPreviousDay}
          >
            Previous Day
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "PPP")}
                {isToday(selectedDate) && (
                  <Badge className="ml-2 bg-primary text-xs">Today</Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && onDateChange(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToNextDay}
          >
            Next Day
          </Button>
          
          {!isToday(selectedDate) && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToToday}
            >
              Go to Today
            </Button>
          )}
        </div>
        
        {isAdminView && (
          <div className="w-full md:w-[240px]">
            <Select
              value={selectedEmployee?.toString() || ""}
              onValueChange={(value) => setSelectedEmployee(value ? Number(value) : null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All employees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All employees</SelectItem>
                {employees.map(employee => (
                  <SelectItem key={employee.id} value={employee.id.toString()}>
                    {employee.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      {/* Time Entries Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {isAdminView && <TableHead>Employee</TableHead>}
                <TableHead>Shift</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Location</TableHead>
                {isAdminView && <TableHead className="text-right">Verify</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTimeEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdminView ? 7 : 5} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-neutral-500 dark:text-neutral-400">
                      <ClockIcon className="h-10 w-10 mb-2 opacity-50" />
                      <p>No time entries found for this date</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTimeEntries.map((entry) => {
                  const shift = getShiftById(entry.shiftId);
                  const employee = isAdminView ? getEmployeeById(entry.employeeId) : null;
                  
                  return (
                    <TableRow key={entry.id}>
                      {isAdminView && (
                        <TableCell>
                          {employee && (
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarImage src={employee.profilePicture} alt={employee.fullName} />
                                <AvatarFallback className="text-xs">
                                  {employee.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>{employee.fullName}</div>
                            </div>
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        {shift ? (
                          <div>
                            <div className="font-medium">
                              {shift.title || "Regular Shift"}
                            </div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400">
                              {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-neutral-500 dark:text-neutral-400 italic">
                            Unknown Shift
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatTime(entry.clockIn)}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          {format(new Date(entry.clockIn), "MMM d, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        {entry.clockOut ? (
                          <div>
                            <div className="font-medium">
                              {formatTime(entry.clockOut)}
                            </div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400">
                              {format(new Date(entry.clockOut), "MMM d, yyyy")}
                            </div>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-amber-600 border-amber-300">
                            <Clock className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {calculateEntryDuration(entry.clockIn, entry.clockOut)}
                      </TableCell>
                      <TableCell>
                        {entry.coordinates ? (
                          <div className="flex items-center text-sm">
                            <MapPin className="h-3 w-3 mr-1 text-neutral-500" />
                            {getLocationDescription(entry.coordinates)}
                          </div>
                        ) : (
                          <div className="text-neutral-500 dark:text-neutral-400 text-sm italic">
                            No location data
                          </div>
                        )}
                      </TableCell>
                      
                      {isAdminView && (
                        <TableCell className="text-right">
                          <Button
                            variant={entry.verified ? "outline" : "secondary"}
                            size="sm"
                            onClick={() => handleVerifyToggle(entry.id, entry.verified)}
                            disabled={verifyMutation.isPending}
                            className={cn(
                              entry.verified 
                                ? "text-green-600 border-green-300 hover:bg-green-50" 
                                : ""
                            )}
                          >
                            {entry.verified ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Verified
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 mr-1" />
                                Unverified
                              </>
                            )}
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
