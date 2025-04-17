import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shift, TimeEntry } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Clock, MapPin, CheckCircle, AlarmCheck, AlertCircle } from "lucide-react";
import { formatTime, calculateDuration } from "@/lib/utils/date-utils";

interface ClockInOutProps {
  activeShifts: Shift[];
  timeEntries: TimeEntry[];
}

export function ClockInOut({ activeShifts, timeEntries }: ClockInOutProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);
  
  // Get current user coordinates
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      setIsGettingLocation(false);
      return Promise.reject("Geolocation not supported");
    }
    
    return new Promise<GeolocationCoordinates>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation(position.coords);
          setIsGettingLocation(false);
          resolve(position.coords);
        },
        (error) => {
          let errorMessage = "Failed to get your location";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Permission to access location was denied";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "The request to get user location timed out";
              break;
          }
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
          setIsGettingLocation(false);
          reject(errorMessage);
        }
      );
    });
  };
  
  // Find active time entry (clocked in without clock out)
  const activeTimeEntry = timeEntries.find(entry => 
    entry.employeeId === user?.id && !entry.clockOut
  );
  
  // If active time entry exists, find corresponding shift
  const activeTimeEntryShift = activeTimeEntry 
    ? activeShifts.find(shift => shift.id === activeTimeEntry.shiftId)
    : null;
  
  // Clock in mutation
  const clockInMutation = useMutation({
    mutationFn: async ({ shiftId, coordinates }: { shiftId: number, coordinates: { lat: number, lng: number } }) => {
      const data = {
        employeeId: user?.id,
        shiftId,
        clockIn: new Date().toISOString(),
        coordinates: { clockInLocation: coordinates }
      };
      
      const res = await apiRequest("POST", "/api/time-entries", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/time-entries?employeeId=${user?.id}`] });
      toast({
        title: "Clocked in",
        description: "You have successfully clocked in.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to clock in",
        variant: "destructive",
      });
    },
  });
  
  // Clock out mutation
  const clockOutMutation = useMutation({
    mutationFn: async ({ timeEntryId, coordinates }: { timeEntryId: number, coordinates: { lat: number, lng: number } }) => {
      const data = {
        clockOut: new Date().toISOString(),
        coordinates: { 
          ...(activeTimeEntry?.coordinates || {}),
          clockOutLocation: coordinates 
        }
      };
      
      const res = await apiRequest("PATCH", `/api/time-entries/${timeEntryId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/time-entries?employeeId=${user?.id}`] });
      toast({
        title: "Clocked out",
        description: "You have successfully clocked out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to clock out",
        variant: "destructive",
      });
    },
  });
  
  // Handle clock in action
  const handleClockIn = async (shiftId: number) => {
    try {
      const coords = await getCurrentLocation();
      clockInMutation.mutate({ 
        shiftId, 
        coordinates: { lat: coords.latitude, lng: coords.longitude } 
      });
    } catch (error) {
      console.error("Failed to get location", error);
    }
  };
  
  // Handle clock out action
  const handleClockOut = async () => {
    if (!activeTimeEntry) return;
    
    try {
      const coords = await getCurrentLocation();
      clockOutMutation.mutate({ 
        timeEntryId: activeTimeEntry.id, 
        coordinates: { lat: coords.latitude, lng: coords.longitude } 
      });
    } catch (error) {
      console.error("Failed to get location", error);
    }
  };
  
  // Generate clock in/out status message
  const getStatusMessage = () => {
    if (activeTimeEntry) {
      const clockInTime = new Date(activeTimeEntry.clockIn);
      const duration = Math.floor((currentTime.getTime() - clockInTime.getTime()) / (1000 * 60)); // minutes
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      
      return `You've been clocked in for ${hours > 0 ? `${hours} hour${hours !== 1 ? 's' : ''} ` : ''}${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    
    if (activeShifts.length === 0) {
      return "You have no active shifts scheduled for today";
    }
    
    return "You're not clocked in yet";
  };
  
  const isPending = clockInMutation.isPending || clockOutMutation.isPending || isGettingLocation;
  
  // Content for when the user is clocked in
  const clockedInContent = () => (
    <Card className="border-green-200 dark:border-green-800">
      <CardHeader className="bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mr-2" />
            <CardTitle className="text-green-800 dark:text-green-200">
              Currently Clocked In
            </CardTitle>
          </div>
          <Badge className="bg-green-600">Active</Badge>
        </div>
        <CardDescription>
          {getStatusMessage()}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        {activeTimeEntryShift && (
          <div className="space-y-4">
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium">Current Shift</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {activeTimeEntryShift.title || "Regular Shift"}
                </p>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {formatTime(activeTimeEntryShift.startTime)} - {formatTime(activeTimeEntryShift.endTime)}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  {calculateDuration(activeTimeEntryShift.startTime, activeTimeEntryShift.endTime)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-neutral-500 mr-2" />
              <div>
                <span className="text-sm text-neutral-600 dark:text-neutral-400 mr-2">Clock in time:</span>
                <span className="font-medium">{formatTime(activeTimeEntry!.clockIn)}</span>
              </div>
            </div>
            
            {activeTimeEntry?.coordinates?.clockInLocation && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-neutral-500 mr-2" />
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  Location verified at clock in
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10 px-6 py-4">
        <Button 
          className="w-full bg-green-600 hover:bg-green-700"
          onClick={handleClockOut}
          disabled={isPending}
        >
          {isPending ? (
            <>
              <AlarmCheck className="mr-2 h-4 w-4 animate-pulse" />
              Processing...
            </>
          ) : (
            <>
              <AlarmCheck className="mr-2 h-4 w-4" />
              Clock Out
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
  
  // Content for available shifts (not clocked in)
  const availableShiftsContent = () => (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center">
          <Clock className="h-6 w-6 text-primary mr-2" />
          <CardTitle>Time Tracking</CardTitle>
        </div>
        <CardDescription>
          {getStatusMessage()}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        {activeShifts.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-1">No Active Shifts</h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              You don't have any shifts scheduled for today
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="font-medium">Today's Shifts</h3>
            
            <div className="space-y-4">
              {activeShifts.map((shift) => {
                const alreadyTracked = timeEntries.some(entry => 
                  entry.shiftId === shift.id && entry.employeeId === user?.id
                );
                
                return (
                  <div 
                    key={shift.id}
                    className={`p-4 rounded-md border ${
                      alreadyTracked 
                        ? "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700" 
                        : "border-primary-light bg-primary-light/5 dark:bg-primary-dark/10"
                    }`}
                  >
                    <div className="flex justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{shift.title || "Regular Shift"}</h4>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                          {calculateDuration(shift.startTime, shift.endTime)}
                        </div>
                      </div>
                    </div>
                    
                    {alreadyTracked ? (
                      <div className="flex items-center text-neutral-600 dark:text-neutral-400 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                        Already clocked in/out for this shift
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full mt-2"
                        onClick={() => handleClockIn(shift.id)}
                        disabled={isPending}
                      >
                        {isPending ? (
                          <>
                            <Clock className="mr-2 h-4 w-4 animate-pulse" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Clock className="mr-2 h-4 w-4" />
                            Clock In
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
  
  return activeTimeEntry ? clockedInContent() : availableShiftsContent();
}
