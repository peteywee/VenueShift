import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format, addDays, addWeeks, subWeeks } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Shift, Venue } from "@shared/schema";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatTime } from "@/lib/utils/date-utils";

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Calculate week range
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Start from Monday
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // End on Sunday
  
  // Format dates for API query
  const startDate = format(startOfWeek, "yyyy-MM-dd");
  const endDate = format(endOfWeek, "yyyy-MM-dd");
  
  // Fetch shifts for the week
  const { data: shifts, isLoading: isLoadingShifts } = useQuery<Shift[]>({
    queryKey: [`/api/shifts?startDate=${startDate}&endDate=${endDate}`],
  });
  
  // Fetch venues for the shifts
  const { data: venues, isLoading: isLoadingVenues } = useQuery<Venue[]>({
    queryKey: ["/api/venues"],
  });
  
  const isLoading = isLoadingShifts || isLoadingVenues;
  
  // Generate array of dates for the week
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });
  
  // Get venue name by ID
  const getVenueName = (venueId: number) => {
    const venue = venues?.find(v => v.id === venueId);
    return venue?.name || "Unknown Venue";
  };
  
  // Get shifts for a specific day
  const getShiftsForDay = (date: Date) => {
    if (!shifts) return [];
    
    return shifts.filter(shift => {
      const shiftDate = new Date(shift.startTime);
      return (
        shiftDate.getDate() === date.getDate() &&
        shiftDate.getMonth() === date.getMonth() &&
        shiftDate.getFullYear() === date.getFullYear()
      );
    });
  };
  
  // Navigate to previous week
  const goToPreviousWeek = () => {
    setCurrentDate(prevDate => subWeeks(prevDate, 1));
  };
  
  // Navigate to next week
  const goToNextWeek = () => {
    setCurrentDate(prevDate => addWeeks(prevDate, 1));
  };
  
  return (
    <Card className="border border-neutral-200 dark:border-neutral-800">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Calendar</CardTitle>
          <div className="flex space-x-2 items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={goToPreviousWeek}
              aria-label="Previous week"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-neutral-900 dark:text-neutral-100 font-medium">
              {format(startOfWeek, "MMM d")} - {format(endOfWeek, "MMM d, yyyy")}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={goToNextWeek}
              aria-label="Next week"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }).map((_, index) => (
                <Skeleton key={index} className="h-8" />
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }).map((_, index) => (
                <Skeleton key={index} className="h-24" />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {/* Day Headers */}
            {weekDays.map((day, index) => (
              <div 
                key={index} 
                className="text-center py-2 border-b border-neutral-200 dark:border-neutral-800 font-medium text-sm"
              >
                <div className="text-neutral-500 dark:text-neutral-400">
                  {format(day, "EEE")}
                </div>
                <div className="text-neutral-900 dark:text-neutral-100 mt-1">
                  {format(day, "d")}
                </div>
              </div>
            ))}
            
            {/* Calendar Events */}
            {weekDays.map((day, dayIndex) => {
              const dayShifts = getShiftsForDay(day);
              
              return (
                <div 
                  key={dayIndex} 
                  className={`p-1 h-24 border-b border-r border-neutral-200 dark:border-neutral-800 relative ${
                    dayIndex === 6 ? "border-r-0" : ""
                  }`}
                >
                  {dayShifts.map((shift, shiftIndex) => {
                    // Alternate colors between primary and secondary
                    const colorClass = shiftIndex % 2 === 0
                      ? "bg-primary bg-opacity-10 dark:bg-opacity-20 text-primary dark:text-primary-light"
                      : "bg-secondary bg-opacity-10 dark:bg-opacity-20 text-secondary dark:text-secondary-light";
                    
                    return (
                      <Link key={shift.id} href={`/schedule?shift=${shift.id}`}>
                        <a 
                          className={`absolute top-${shiftIndex + 1} left-1 right-1 ${colorClass} rounded p-1 text-xs overflow-hidden mb-1`}
                          style={{ top: `${(shiftIndex * 20) + 4}px` }}
                        >
                          <div className="font-medium truncate">{getVenueName(shift.venueId)}</div>
                          <div className="truncate">{formatTime(shift.startTime)} - {formatTime(shift.endTime)}</div>
                        </a>
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-3 flex justify-center">
        <Link href="/schedule">
          <a className="text-sm font-medium text-primary dark:text-primary-light flex items-center">
            View full calendar
            <ChevronRight className="ml-1 h-4 w-4" />
          </a>
        </Link>
      </CardFooter>
    </Card>
  );
}
