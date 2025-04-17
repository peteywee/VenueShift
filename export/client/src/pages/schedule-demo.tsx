import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { 
  Calendar as CalendarIcon,
  Clock,
  User,
  Building2,
  Plus,
  Trash2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Define shift interface
interface Shift {
  id: number;
  title: string;
  start: Date;
  end: Date;
  employeeId: number;
  employeeName: string;
  venueId: number;
  venueName: string;
  notes: string;
  status: 'scheduled' | 'inProgress' | 'completed' | 'cancelled';
}

// Define calendar day interface
interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  shifts: Shift[];
}

export default function ScheduleDemo() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isAddShiftDialogOpen, setIsAddShiftDialogOpen] = useState(false);
  const [isViewShiftDialogOpen, setIsViewShiftDialogOpen] = useState(false);
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Current date for calendar
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Sample venues
  const venues = [
    { id: 1, name: "Main Street Arts Center" },
    { id: 2, name: "Westside Community Hall" },
    { id: 3, name: "Harbor View Conference Center" },
    { id: 4, name: "Oakwood Recreation Center" }
  ];
  
  // Sample employees
  const employees = [
    { id: 1, name: "John Smith", venueId: 1 },
    { id: 2, name: "Jane Doe", venueId: 1 },
    { id: 3, name: "Robert Johnson", venueId: 2 },
    { id: 4, name: "Maria Garcia", venueId: 3 },
    { id: 5, name: "David Chen", venueId: 3 },
    { id: 6, name: "Michael Brown", venueId: 4 }
  ];
  
  // Sample demo shifts data
  const [shifts, setShifts] = useState<Shift[]>(() => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return [
      {
        id: 1,
        title: "Morning Shift",
        start: new Date(today.setHours(8, 0, 0, 0)),
        end: new Date(today.setHours(16, 0, 0, 0)),
        employeeId: 1,
        employeeName: "John Smith",
        venueId: 1,
        venueName: "Main Street Arts Center",
        notes: "Opening shift, prepare ticket counter and systems.",
        status: "scheduled"
      },
      {
        id: 2,
        title: "Evening Shift",
        start: new Date(today.setHours(16, 0, 0, 0)),
        end: new Date(today.setHours(23, 0, 0, 0)),
        employeeId: 2,
        employeeName: "Jane Doe",
        venueId: 1,
        venueName: "Main Street Arts Center",
        notes: "Closing shift, ensure all systems are shut down properly.",
        status: "scheduled"
      },
      {
        id: 3,
        title: "Full Day",
        start: new Date(tomorrow.setHours(9, 0, 0, 0)),
        end: new Date(tomorrow.setHours(17, 0, 0, 0)),
        employeeId: 3,
        employeeName: "Robert Johnson",
        venueId: 2,
        venueName: "Westside Community Hall",
        notes: "Community event day, expect higher traffic.",
        status: "scheduled"
      },
      {
        id: 4,
        title: "Morning Shift",
        start: new Date(yesterday.setHours(8, 0, 0, 0)),
        end: new Date(yesterday.setHours(16, 0, 0, 0)),
        employeeId: 4,
        employeeName: "Maria Garcia",
        venueId: 3,
        venueName: "Harbor View Conference Center",
        notes: "Conference setup and ticket sales.",
        status: "completed"
      },
      {
        id: 5,
        title: "Evening Event",
        start: new Date(nextWeek.setHours(18, 0, 0, 0)),
        end: new Date(nextWeek.setHours(22, 0, 0, 0)),
        employeeId: 5,
        employeeName: "David Chen",
        venueId: 3,
        venueName: "Harbor View Conference Center",
        notes: "Special evening event, formal attire.",
        status: "scheduled"
      }
    ];
  });
  
  // New shift form state
  const [newShift, setNewShift] = useState<Omit<Shift, 'id'>>({
    title: '',
    start: new Date(),
    end: new Date(),
    employeeId: 0,
    employeeName: '',
    venueId: 0,
    venueName: '',
    notes: '',
    status: 'scheduled'
  });
  
  // Generate calendar days for current month view
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of the week for the first day of the month (0-6, where 0 is Sunday)
    const firstDayOfWeek = firstDay.getDay();
    
    // Calculate days from previous month to show
    const daysFromPrevMonth = firstDayOfWeek;
    
    // Calculate total days needed (previous month days + current month days)
    const totalDays = daysFromPrevMonth + lastDay.getDate();
    
    // Calculate rows needed (weeks)
    const numRows = Math.ceil(totalDays / 7);
    
    // Calculate total cells (days) to create
    const totalCells = numRows * 7;
    
    // Calculate days from next month to show
    const daysFromNextMonth = totalCells - (daysFromPrevMonth + lastDay.getDate());
    
    // Create array to hold all calendar days
    const calendarDays: CalendarDay[] = [];
    
    // Get the current date for highlighting today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Add days from previous month
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthLastDay = prevMonth.getDate();
    
    for (let i = prevMonthLastDay - daysFromPrevMonth + 1; i <= prevMonthLastDay; i++) {
      const date = new Date(year, month - 1, i);
      calendarDays.push({
        date,
        isCurrentMonth: false,
        isToday: date.getTime() === today.getTime(),
        shifts: getShiftsForDate(date)
      });
    }
    
    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      calendarDays.push({
        date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        shifts: getShiftsForDate(date)
      });
    }
    
    // Add days from next month
    for (let i = 1; i <= daysFromNextMonth; i++) {
      const date = new Date(year, month + 1, i);
      calendarDays.push({
        date,
        isCurrentMonth: false,
        isToday: date.getTime() === today.getTime(),
        shifts: getShiftsForDate(date)
      });
    }
    
    return calendarDays;
  };
  
  // Get shifts for a specific date
  const getShiftsForDate = (date: Date) => {
    return shifts.filter(shift => {
      const shiftDate = new Date(shift.start);
      return (
        shiftDate.getFullYear() === date.getFullYear() &&
        shiftDate.getMonth() === date.getMonth() &&
        shiftDate.getDate() === date.getDate()
      );
    });
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Format date for input fields
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Format time for input fields
  const formatTimeForInput = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => {
      const year = prevMonth.getFullYear();
      const month = prevMonth.getMonth();
      return new Date(year, month - 1, 1);
    });
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => {
      const year = prevMonth.getFullYear();
      const month = prevMonth.getMonth();
      return new Date(year, month + 1, 1);
    });
  };
  
  // Navigate to current month
  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };
  
  // Open add shift dialog
  const openAddShiftDialog = (date: Date) => {
    setSelectedDate(date);
    
    // Set default times (9 AM - 5 PM)
    const startTime = new Date(date);
    startTime.setHours(9, 0, 0, 0);
    
    const endTime = new Date(date);
    endTime.setHours(17, 0, 0, 0);
    
    setNewShift({
      title: '',
      start: startTime,
      end: endTime,
      employeeId: 0,
      employeeName: '',
      venueId: 0,
      venueName: '',
      notes: '',
      status: 'scheduled'
    });
    
    setIsAddShiftDialogOpen(true);
  };
  
  // Open view shift dialog
  const openViewShiftDialog = (shift: Shift) => {
    setActiveShift(shift);
    setIsViewShiftDialogOpen(true);
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewShift(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'startDate') {
      const startDate = new Date(value);
      const currentStart = new Date(newShift.start);
      startDate.setHours(currentStart.getHours(), currentStart.getMinutes(), 0, 0);
      
      setNewShift(prev => ({ ...prev, start: startDate }));
    } else if (name === 'endDate') {
      const endDate = new Date(value);
      const currentEnd = new Date(newShift.end);
      endDate.setHours(currentEnd.getHours(), currentEnd.getMinutes(), 0, 0);
      
      setNewShift(prev => ({ ...prev, end: endDate }));
    }
  };
  
  // Handle time change
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'startTime') {
      const [hours, minutes] = value.split(':').map(Number);
      const startTime = new Date(newShift.start);
      startTime.setHours(hours, minutes, 0, 0);
      
      setNewShift(prev => ({ ...prev, start: startTime }));
    } else if (name === 'endTime') {
      const [hours, minutes] = value.split(':').map(Number);
      const endTime = new Date(newShift.end);
      endTime.setHours(hours, minutes, 0, 0);
      
      setNewShift(prev => ({ ...prev, end: endTime }));
    }
  };
  
  // Handle employee change
  const handleEmployeeChange = (value: string) => {
    const employeeId = parseInt(value);
    const employee = employees.find(e => e.id === employeeId);
    
    if (employee) {
      setNewShift(prev => ({ 
        ...prev, 
        employeeId,
        employeeName: employee.name
      }));
    }
  };
  
  // Handle venue change
  const handleVenueChange = (value: string) => {
    const venueId = parseInt(value);
    const venue = venues.find(v => v.id === venueId);
    
    if (venue) {
      setNewShift(prev => ({ 
        ...prev, 
        venueId,
        venueName: venue.name
      }));
    }
  };
  
  // Add a new shift
  const addShift = () => {
    setIsLoading(true);
    
    // Validation
    if (!newShift.title || !newShift.employeeId || !newShift.venueId) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }
    
    // Check if end time is after start time
    if (newShift.end <= newShift.start) {
      toast({
        title: 'Invalid Time Range',
        description: 'End time must be after start time',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      const newId = Math.max(...shifts.map(s => s.id), 0) + 1;
      const createdShift = { ...newShift, id: newId };
      
      setShifts(prev => [...prev, createdShift]);
      setIsAddShiftDialogOpen(false);
      
      toast({
        title: 'Shift Added',
        description: `${createdShift.title} has been scheduled successfully`,
      });
      
      setIsLoading(false);
    }, 1000);
  };
  
  // Delete a shift
  const deleteShift = (id: number) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const shiftToDelete = shifts.find(s => s.id === id);
      setShifts(prev => prev.filter(shift => shift.id !== id));
      
      setIsViewShiftDialogOpen(false);
      setActiveShift(null);
      
      toast({
        title: 'Shift Deleted',
        description: `${shiftToDelete?.title} has been removed from the schedule`,
        variant: 'default',
      });
      
      setIsLoading(false);
    }, 1000);
  };
  
  // Generate avatar fallback from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Get shift status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline">Scheduled</Badge>;
      case 'inProgress':
        return <Badge variant="default">In Progress</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return null;
    }
  };
  
  // Calculate calendar days
  const calendarDays = getCalendarDays();
  
  return (
    <div className="container py-8">
      <Button variant="ghost" className="absolute top-4 left-4 gap-2" onClick={() => navigate('/demo-dashboard')}>
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>
      
      <div className="flex flex-col space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Shift Schedule</h1>
          <p className="text-muted-foreground">
            Manage employee shifts across all venues
          </p>
        </div>
        
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-medium">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button variant="outline" onClick={goToCurrentMonth}>
            Today
          </Button>
        </div>
        
        {/* Calendar Grid */}
        <div className="bg-white dark:bg-gray-950 rounded-lg border overflow-hidden">
          {/* Calendar Day Names */}
          <div className="grid grid-cols-7 gap-px bg-muted">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <div key={day} className="text-center py-2 font-semibold text-sm">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Cells */}
          <div className="grid grid-cols-7 gap-px bg-muted">
            {calendarDays.map((day, index) => (
              <div 
                key={index} 
                className={cn(
                  "bg-card h-32 p-2 flex flex-col",
                  !day.isCurrentMonth && "opacity-50",
                  day.isToday && "bg-primary/5"
                )}
              >
                <div className="flex justify-between">
                  <span className={cn(
                    "text-sm h-6 w-6 flex items-center justify-center rounded-full",
                    day.isToday && "bg-primary text-primary-foreground font-medium"
                  )}>
                    {day.date.getDate()}
                  </span>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => openAddShiftDialog(day.date)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Shifts for this day */}
                <div className="mt-1 space-y-1 overflow-y-auto flex-1 text-xs">
                  {day.shifts.map(shift => (
                    <div 
                      key={shift.id}
                      onClick={() => openViewShiftDialog(shift)}
                      className={cn(
                        "p-1 rounded truncate cursor-pointer hover:opacity-80",
                        shift.status === 'completed' ? "bg-gray-200 dark:bg-gray-800" : 
                        shift.status === 'cancelled' ? "bg-red-100 dark:bg-red-900/30" : 
                        "bg-primary/20"
                      )}
                    >
                      <div className="font-medium truncate">{shift.title}</div>
                      <div className="flex justify-between">
                        <span>{formatTime(shift.start)}</span>
                        <span className="truncate">{shift.employeeName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Add Shift Dialog */}
        <Dialog open={isAddShiftDialogOpen} onOpenChange={setIsAddShiftDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Shift</DialogTitle>
              <DialogDescription>
                Schedule a new shift for an employee at a specific venue.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Shift Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={newShift.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Morning Shift, Evening Event, etc."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">Employee *</Label>
                  <Select 
                    value={newShift.employeeId ? newShift.employeeId.toString() : ""}
                    onValueChange={handleEmployeeChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(employee => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="venue">Venue *</Label>
                  <Select 
                    value={newShift.venueId ? newShift.venueId.toString() : ""}
                    onValueChange={handleVenueChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select venue" />
                    </SelectTrigger>
                    <SelectContent>
                      {venues.map(venue => (
                        <SelectItem key={venue.id} value={venue.id.toString()}>
                          {venue.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <div className="relative">
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formatDateForInput(newShift.start)}
                      onChange={handleDateChange}
                      className="pl-9"
                    />
                    <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <div className="relative">
                    <Input
                      id="startTime"
                      name="startTime"
                      type="time"
                      value={formatTimeForInput(newShift.start).substring(0, 5)}
                      onChange={handleTimeChange}
                      className="pl-9"
                    />
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <div className="relative">
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={formatDateForInput(newShift.end)}
                      onChange={handleDateChange}
                      className="pl-9"
                    />
                    <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <div className="relative">
                    <Input
                      id="endTime"
                      name="endTime"
                      type="time"
                      value={formatTimeForInput(newShift.end).substring(0, 5)}
                      onChange={handleTimeChange}
                      className="pl-9"
                    />
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={newShift.notes}
                  onChange={handleInputChange}
                  className="min-h-[80px] resize-none"
                  placeholder="Add any additional information about this shift"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddShiftDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addShift} disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Shift'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* View Shift Dialog */}
        <Dialog open={isViewShiftDialogOpen} onOpenChange={setIsViewShiftDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            {activeShift && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span>{activeShift.title}</span>
                    {getStatusBadge(activeShift.status)}
                  </DialogTitle>
                  <DialogDescription>
                    Shift details and information
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(activeShift.employeeName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{activeShift.employeeName}</h4>
                      <p className="text-sm text-muted-foreground">Employee</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Venue</p>
                      <p className="text-sm">{activeShift.venueName}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Date</p>
                      <p className="text-sm">{formatDate(activeShift.start)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Start Time</p>
                      <p className="text-sm">{formatTime(activeShift.start)}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">End Time</p>
                      <p className="text-sm">{formatTime(activeShift.end)}</p>
                    </div>
                  </div>
                  
                  {activeShift.notes && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Notes</p>
                      <p className="text-sm">{activeShift.notes}</p>
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="destructive" 
                    onClick={() => deleteShift(activeShift.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Deleting...' : 'Delete Shift'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsViewShiftDialogOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
        
        <div className="text-center pt-4">
          <h2 className="text-xl font-semibold mb-2">Schedule Management Demo</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            This demo showcases the shift scheduling functionality. In a real application,
            staff would receive notifications about scheduled shifts, and administrators could 
            implement recurring schedule patterns and manage shift swaps between employees.
          </p>
        </div>
      </div>
    </div>
  );
}