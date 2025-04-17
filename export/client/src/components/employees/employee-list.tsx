import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, UserRole } from "@shared/schema";
import { Pencil, MoreVertical, Search, User as UserIcon, ShieldAlert, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface EmployeeListProps {
  employees: User[];
  isLoading: boolean;
  onEdit: (employee: User) => void;
  onUpdateRole: (employeeId: number, role: string) => void;
}

export function EmployeeList({ employees, isLoading, onEdit, onUpdateRole }: EmployeeListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  
  // Filter employees based on search term and role filter
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter ? employee.role === roleFilter : true;
    
    return matchesSearch && matchesRole;
  });
  
  // Get the appropriate badge for user role
  const getRoleBadge = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Badge variant="default" className="bg-primary-light">Admin</Badge>;
      case UserRole.IT:
        return <Badge variant="default" className="bg-amber-500">IT</Badge>;
      case UserRole.EMPLOYEE:
        return <Badge variant="outline">Employee</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };
  
  // Get user initials for avatar fallback
  const getUserInitials = (fullName: string) => {
    if (!fullName) return "U";
    
    const nameParts = fullName.split(" ");
    if (nameParts.length === 1) return nameParts[0][0].toUpperCase();
    
    return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
  };
  
  // Get icon for role
  const getRoleIcon = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return <ShieldAlert className="h-4 w-4 mr-2 text-primary" />;
      case UserRole.IT:
        return <Shield className="h-4 w-4 mr-2 text-amber-500" />;
      case UserRole.EMPLOYEE:
        return <UserIcon className="h-4 w-4 mr-2 text-neutral-500" />;
      default:
        return <UserIcon className="h-4 w-4 mr-2" />;
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-full max-w-sm" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="h-12 px-4 text-left font-medium"><Skeleton className="h-4 w-20" /></th>
                      <th className="h-12 px-4 text-left font-medium"><Skeleton className="h-4 w-20" /></th>
                      <th className="h-12 px-4 text-left font-medium"><Skeleton className="h-4 w-20" /></th>
                      <th className="h-12 px-4 text-left font-medium"><Skeleton className="h-4 w-20" /></th>
                      <th className="h-12 px-4 text-left font-medium"><Skeleton className="h-4 w-20" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-4"><Skeleton className="h-8 w-8 rounded-full" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 h-4 w-4" />
          <Input 
            placeholder="Search employees..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant={roleFilter === null ? "secondary" : "outline"} 
            size="sm"
            onClick={() => setRoleFilter(null)}
          >
            All
          </Button>
          <Button 
            variant={roleFilter === UserRole.ADMIN ? "secondary" : "outline"} 
            size="sm"
            onClick={() => setRoleFilter(UserRole.ADMIN)}
          >
            Admins
          </Button>
          <Button 
            variant={roleFilter === UserRole.EMPLOYEE ? "secondary" : "outline"} 
            size="sm"
            onClick={() => setRoleFilter(UserRole.EMPLOYEE)}
          >
            Employees
          </Button>
          <Button 
            variant={roleFilter === UserRole.IT ? "secondary" : "outline"} 
            size="sm"
            onClick={() => setRoleFilter(UserRole.IT)}
          >
            IT
          </Button>
        </div>
      </div>
      
      {filteredEmployees.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-48 p-6">
            <UserIcon className="h-12 w-12 text-neutral-400 mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400 text-center">
              {employees.length === 0 
                ? "No employees have been added yet. Create your first employee to get started." 
                : "No employees match your search criteria. Try adjusting your filters."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="border-b bg-neutral-50 dark:bg-neutral-900">
                      <th className="h-12 px-4 text-left font-medium"></th>
                      <th className="h-12 px-4 text-left font-medium">Name</th>
                      <th className="h-12 px-4 text-left font-medium hidden md:table-cell">Contact</th>
                      <th className="h-12 px-4 text-left font-medium">Role</th>
                      <th className="h-12 px-4 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((employee) => (
                      <tr 
                        key={employee.id} 
                        className="border-b transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
                      >
                        <td className="p-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={employee.profilePicture} alt={employee.fullName} />
                            <AvatarFallback className="bg-primary text-white">
                              {getUserInitials(employee.fullName)}
                            </AvatarFallback>
                          </Avatar>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{employee.fullName}</div>
                          <div className="text-neutral-500 dark:text-neutral-400 text-xs">{employee.username}</div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <div>{employee.email}</div>
                          <div className="text-neutral-500 dark:text-neutral-400 text-xs">{employee.phone}</div>
                        </td>
                        <td className="p-4">
                          {getRoleBadge(employee.role)}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mr-2"
                              onClick={() => onEdit(employee)}
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => onUpdateRole(employee.id, UserRole.ADMIN)}
                                  disabled={employee.role === UserRole.ADMIN}
                                >
                                  {getRoleIcon(UserRole.ADMIN)}
                                  Set as Admin
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => onUpdateRole(employee.id, UserRole.EMPLOYEE)}
                                  disabled={employee.role === UserRole.EMPLOYEE}
                                >
                                  {getRoleIcon(UserRole.EMPLOYEE)}
                                  Set as Employee
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => onUpdateRole(employee.id, UserRole.IT)}
                                  disabled={employee.role === UserRole.IT}
                                >
                                  {getRoleIcon(UserRole.IT)}
                                  Set as IT Support
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
