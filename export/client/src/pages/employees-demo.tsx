import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { 
  User,
  Phone,
  Mail,
  UserPlus,
  Pencil,
  Trash2,
  Search,
  ArrowLeft,
  Clock,
  Calendar,
  CircleUser,
  Building2
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

// Define employee interface
interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  venueId: number | null;
  venueName: string | null;
  profileImage: string | null;
  status: 'active' | 'inactive' | 'onLeave';
  notes: string;
  startDate: string;
}

export default function EmployeesDemo() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
  
  // Sample demo employees data
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "(212) 555-1234",
      role: "Manager",
      venueId: 1,
      venueName: "Main Street Arts Center",
      profileImage: null,
      status: "active",
      notes: "Experienced manager with 5+ years in the organization.",
      startDate: "2020-03-15"
    },
    {
      id: 2,
      name: "Jane Doe",
      email: "jane.doe@example.com",
      phone: "(212) 555-5678",
      role: "Assistant Manager",
      venueId: 1,
      venueName: "Main Street Arts Center",
      profileImage: null,
      status: "active",
      notes: "Promoted from Cashier in January 2023.",
      startDate: "2021-06-01"
    },
    {
      id: 3,
      name: "Robert Johnson",
      email: "robert.j@example.com",
      phone: "(310) 555-9012",
      role: "Manager",
      venueId: 2,
      venueName: "Westside Community Hall",
      profileImage: null,
      status: "active",
      notes: "Has certifications in event management.",
      startDate: "2019-11-10"
    },
    {
      id: 4,
      name: "Maria Garcia",
      email: "maria.g@example.com",
      phone: "(415) 555-3456",
      role: "Assistant Manager",
      venueId: 3,
      venueName: "Harbor View Conference Center",
      profileImage: null,
      status: "onLeave",
      notes: "On maternity leave until September 2023.",
      startDate: "2020-08-22"
    },
    {
      id: 5,
      name: "David Chen",
      email: "david.c@example.com",
      phone: "(415) 555-7890",
      role: "Cashier",
      venueId: 3,
      venueName: "Harbor View Conference Center",
      profileImage: null,
      status: "active",
      notes: "Part-time employee, available weekends and evenings.",
      startDate: "2022-01-15"
    },
    {
      id: 6,
      name: "Michael Brown",
      email: "michael.b@example.com",
      phone: "(312) 555-1234",
      role: "Manager",
      venueId: 4,
      venueName: "Oakwood Recreation Center",
      profileImage: null,
      status: "inactive",
      notes: "Temporarily reassigned during venue renovations.",
      startDate: "2018-05-01"
    }
  ]);
  
  // Available venues
  const venues = [
    { id: 1, name: "Main Street Arts Center" },
    { id: 2, name: "Westside Community Hall" },
    { id: 3, name: "Harbor View Conference Center" },
    { id: 4, name: "Oakwood Recreation Center" }
  ];
  
  // New employee form state
  const [newEmployee, setNewEmployee] = useState<Omit<Employee, 'id'>>({
    name: '',
    email: '',
    phone: '',
    role: 'Cashier',
    venueId: null,
    venueName: null,
    profileImage: null,
    status: 'active',
    notes: '',
    startDate: new Date().toISOString().split('T')[0]
  });
  
  // Filter employees based on search query
  const filteredEmployees = employees.filter(employee => 
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (employee.venueName && employee.venueName.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (activeEmployee) {
      setActiveEmployee(prev => prev ? { ...prev, [name]: value } : null);
    } else {
      setNewEmployee(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle role change
  const handleRoleChange = (value: string) => {
    if (activeEmployee) {
      setActiveEmployee(prev => prev ? { ...prev, role: value } : null);
    } else {
      setNewEmployee(prev => ({ ...prev, role: value }));
    }
  };
  
  // Handle status change
  const handleStatusChange = (value: string) => {
    if (activeEmployee) {
      setActiveEmployee(prev => prev ? { 
        ...prev, 
        status: value as 'active' | 'inactive' | 'onLeave' 
      } : null);
    } else {
      setNewEmployee(prev => ({ 
        ...prev, 
        status: value as 'active' | 'inactive' | 'onLeave'
      }));
    }
  };
  
  // Handle venue change
  const handleVenueChange = (value: string) => {
    const venueId = parseInt(value);
    const venue = venues.find(v => v.id === venueId);
    
    if (activeEmployee) {
      setActiveEmployee(prev => prev ? { 
        ...prev, 
        venueId,
        venueName: venue?.name || null
      } : null);
    } else {
      setNewEmployee(prev => ({ 
        ...prev, 
        venueId,
        venueName: venue?.name || null
      }));
    }
  };
  
  // Open edit dialog
  const openEditDialog = (employee: Employee) => {
    setActiveEmployee({ ...employee });
    setIsEditDialogOpen(true);
  };
  
  // Add a new employee
  const addEmployee = () => {
    setIsLoading(true);
    
    // Validation
    if (!newEmployee.name || !newEmployee.email) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      const newId = Math.max(...employees.map(e => e.id), 0) + 1;
      const createdEmployee = { ...newEmployee, id: newId };
      
      setEmployees(prev => [...prev, createdEmployee]);
      setIsAddDialogOpen(false);
      setNewEmployee({
        name: '',
        email: '',
        phone: '',
        role: 'Cashier',
        venueId: null,
        venueName: null,
        profileImage: null,
        status: 'active',
        notes: '',
        startDate: new Date().toISOString().split('T')[0]
      });
      
      toast({
        title: 'Employee Added',
        description: `${createdEmployee.name} has been added successfully`,
      });
      
      setIsLoading(false);
    }, 1000);
  };
  
  // Update an employee
  const updateEmployee = () => {
    if (!activeEmployee) return;
    
    setIsLoading(true);
    
    // Validation
    if (!activeEmployee.name || !activeEmployee.email) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      setEmployees(prev => 
        prev.map(employee => 
          employee.id === activeEmployee.id ? activeEmployee : employee
        )
      );
      
      setIsEditDialogOpen(false);
      setActiveEmployee(null);
      
      toast({
        title: 'Employee Updated',
        description: `${activeEmployee.name}'s information has been updated`,
      });
      
      setIsLoading(false);
    }, 1000);
  };
  
  // Delete an employee
  const deleteEmployee = (id: number) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const employeeToDelete = employees.find(e => e.id === id);
      setEmployees(prev => prev.filter(employee => employee.id !== id));
      
      toast({
        title: 'Employee Removed',
        description: `${employeeToDelete?.name} has been removed`,
        variant: 'default',
      });
      
      setIsLoading(false);
    }, 1000);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
  
  return (
    <div className="container py-8">
      <Button variant="ghost" className="absolute top-4 left-4 gap-2" onClick={() => navigate('/demo-dashboard')}>
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>
      
      <div className="flex flex-col space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage employees across all your venues
          </p>
        </div>
        
        {/* Search and Add section */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                <span>Add Employee</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Enter employee details. Required fields are marked with an asterisk (*).
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <div className="relative">
                    <Input
                      id="name"
                      name="name"
                      value={newEmployee.name}
                      onChange={handleInputChange}
                      className="pl-9"
                      placeholder="Enter employee's full name"
                    />
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={newEmployee.email}
                        onChange={handleInputChange}
                        className="pl-9"
                        placeholder="Enter email address"
                      />
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        name="phone"
                        value={newEmployee.phone}
                        onChange={handleInputChange}
                        className="pl-9"
                        placeholder="Enter phone number"
                      />
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select 
                      value={newEmployee.role} 
                      onValueChange={handleRoleChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cashier">Cashier</SelectItem>
                        <SelectItem value="Assistant Manager">Assistant Manager</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Administrator">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={newEmployee.status} 
                      onValueChange={handleStatusChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="onLeave">On Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="venue">Assigned Venue</Label>
                    <Select 
                      value={newEmployee.venueId?.toString() || ""} 
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <div className="relative">
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={newEmployee.startDate}
                        onChange={handleInputChange}
                        className="pl-9"
                      />
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={newEmployee.notes}
                    onChange={handleInputChange}
                    className="min-h-[80px] resize-none"
                    placeholder="Add any additional information about this employee"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addEmployee} disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add Employee'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Edit Employee Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Employee</DialogTitle>
                <DialogDescription>
                  Update employee details. Required fields are marked with an asterisk (*).
                </DialogDescription>
              </DialogHeader>
              
              {activeEmployee && (
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Full Name *</Label>
                    <div className="relative">
                      <Input
                        id="edit-name"
                        name="name"
                        value={activeEmployee.name}
                        onChange={handleInputChange}
                        className="pl-9"
                        placeholder="Enter employee's full name"
                      />
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-email">Email Address *</Label>
                      <div className="relative">
                        <Input
                          id="edit-email"
                          name="email"
                          type="email"
                          value={activeEmployee.email}
                          onChange={handleInputChange}
                          className="pl-9"
                          placeholder="Enter email address"
                        />
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-phone">Phone Number</Label>
                      <div className="relative">
                        <Input
                          id="edit-phone"
                          name="phone"
                          value={activeEmployee.phone}
                          onChange={handleInputChange}
                          className="pl-9"
                          placeholder="Enter phone number"
                        />
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-role">Role</Label>
                      <Select 
                        value={activeEmployee.role} 
                        onValueChange={handleRoleChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cashier">Cashier</SelectItem>
                          <SelectItem value="Assistant Manager">Assistant Manager</SelectItem>
                          <SelectItem value="Manager">Manager</SelectItem>
                          <SelectItem value="Administrator">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-status">Status</Label>
                      <Select 
                        value={activeEmployee.status} 
                        onValueChange={handleStatusChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="onLeave">On Leave</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-venue">Assigned Venue</Label>
                      <Select 
                        value={activeEmployee.venueId?.toString() || ""} 
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
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-startDate">Start Date</Label>
                      <div className="relative">
                        <Input
                          id="edit-startDate"
                          name="startDate"
                          type="date"
                          value={activeEmployee.startDate}
                          onChange={handleInputChange}
                          className="pl-9"
                        />
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-notes">Notes</Label>
                    <Textarea
                      id="edit-notes"
                      name="notes"
                      value={activeEmployee.notes}
                      onChange={handleInputChange}
                      className="min-h-[80px] resize-none"
                      placeholder="Add any additional information about this employee"
                    />
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={updateEmployee} disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Employee'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Employees Table */}
        <Card className="overflow-hidden">
          <Table>
            <TableCaption>List of employees in your organization</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No employees found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={employee.profileImage || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(employee.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{employee.name}</span>
                          <span className="text-xs text-muted-foreground">{employee.email}</span>
                          {employee.phone && (
                            <span className="text-xs text-muted-foreground">{employee.phone}</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {employee.venueName ? (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{employee.venueName}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          employee.status === 'active' ? 'default' : 
                          employee.status === 'onLeave' ? 'outline' : 'secondary'
                        }
                      >
                        {employee.status === 'active' ? 'Active' :
                         employee.status === 'onLeave' ? 'On Leave' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(employee.startDate)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(employee)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit Employee</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteEmployee(employee.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Remove Employee</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
        
        <div className="text-center pt-4">
          <h2 className="text-xl font-semibold mb-2">Staff Management Demo</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            This demo showcases the staff management functionality. In a real application,
            the system would integrate with your HR system and provide additional features like
            shift assignment, performance tracking, and advanced filtering options.
          </p>
        </div>
      </div>
    </div>
  );
}