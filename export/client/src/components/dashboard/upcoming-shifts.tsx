import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format, addDays } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shift, Venue, User } from "@shared/schema";
import { formatDateTime, formatTime, calculateDuration } from "@/lib/utils/date-utils";

export function UpcomingShifts() {
  const today = new Date();
  const nextWeek = addDays(today, 7);
  
  // Format dates for API query
  const startDate = format(today, "yyyy-MM-dd");
  const endDate = format(nextWeek, "yyyy-MM-dd");
  
  // Fetch upcoming shifts
  const { data: shifts, isLoading: isLoadingShifts } = useQuery<Shift[]>({
    queryKey: [`/api/shifts?startDate=${startDate}&endDate=${endDate}`],
  });
  
  // Fetch venues for the shifts
  const { data: venues, isLoading: isLoadingVenues } = useQuery<Venue[]>({
    queryKey: ["/api/venues"],
  });
  
  // Fetch employees for the shifts
  const { data: employees, isLoading: isLoadingEmployees } = useQuery<User[]>({
    queryKey: ["/api/users/employees"],
  });
  
  const isLoading = isLoadingShifts || isLoadingVenues || isLoadingEmployees;
  
  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Upcoming Shifts</h2>
        <Card className="border border-neutral-200 dark:border-neutral-800">
          <div className="overflow-x-auto">
            <div className="p-4 space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex flex-col space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-6 w-1/4" />
                  </div>
                  <div className="flex">
                    <Skeleton className="h-10 w-10 rounded-full mr-3" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-1/3 mb-2" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }
  
  // Get the shift status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Confirmed</Badge>;
      case "pending":
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>;
      case "completed":
        return <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Completed</Badge>;
      case "cancelled":
        return <Badge variant="default" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };
  
  // Get venue name by ID
  const getVenueName = (venueId: number) => {
    const venue = venues?.find(v => v.id === venueId);
    return venue?.name || "Unknown Venue";
  };
  
  // Get venue location by ID
  const getVenueLocation = (venueId: number) => {
    const venue = venues?.find(v => v.id === venueId);
    return venue?.address.split(',')[0] || "";
  };
  
  // Get employee by ID
  const getEmployee = (employeeId?: number) => {
    if (!employeeId) return undefined;
    return employees?.find(e => e.id === employeeId);
  };
  
  const sortedShifts = shifts?.sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  ).slice(0, 5);
  
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Upcoming Shifts</h2>
      <Card className="border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
            <thead className="bg-neutral-50 dark:bg-neutral-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Venue</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Date & Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Employee</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-800">
              {sortedShifts?.length ? (
                sortedShifts.map((shift) => {
                  const employee = getEmployee(shift.employeeId);
                  
                  return (
                    <tr key={shift.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{getVenueName(shift.venueId)}</div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">{getVenueLocation(shift.venueId)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900 dark:text-neutral-100">
                          {formatDateTime(shift.startTime).includes('Today') 
                            ? `Today, ${formatTime(shift.startTime)} - ${formatTime(shift.endTime)}` 
                            : formatDateTime(shift.startTime).split(',')[0] + `, ${formatTime(shift.startTime)} - ${formatTime(shift.endTime)}`}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">{calculateDuration(shift.startTime, shift.endTime)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {employee ? (
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={employee.profilePicture} alt={employee.fullName} />
                                <AvatarFallback className="bg-primary text-white">
                                  {employee.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{employee.fullName}</div>
                              <div className="text-sm text-neutral-500 dark:text-neutral-400">Cashier</div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-neutral-500 dark:text-neutral-400 italic">Unassigned</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(shift.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link href={`/schedule?shift=${shift.id}`}>
                          <Button variant="link" className="text-primary dark:text-primary-light hover:text-primary-dark dark:hover:text-primary-light font-medium mr-3 p-0 h-auto">
                            View
                          </Button>
                        </Link>
                        <Link href={`/schedule/edit/${shift.id}`}>
                          <Button variant="link" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 font-medium p-0 h-auto">
                            Edit
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    No upcoming shifts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
          <Link href="/schedule">
            <a className="text-sm font-medium text-primary dark:text-primary-light flex items-center justify-center sm:justify-start">
              View all shifts
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </Link>
        </div>
      </Card>
    </div>
  );
}
