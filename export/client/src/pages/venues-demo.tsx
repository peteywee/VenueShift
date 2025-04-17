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
import { Textarea } from '@/components/ui/textarea';
import { useLocation } from 'wouter';
import { 
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  Plus,
  Pencil,
  Trash2,
  Search,
  ArrowLeft,
  Clock
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

// Define venue interface
interface Venue {
  id: number;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  capacity: number;
  status: 'active' | 'inactive' | 'maintenance';
  managers: string[];
  operatingHours: string;
}

export default function VenuesDemo() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeVenue, setActiveVenue] = useState<Venue | null>(null);
  
  // Sample demo venues data
  const [venues, setVenues] = useState<Venue[]>([
    {
      id: 1,
      name: "Main Street Arts Center",
      address: "123 Main St",
      city: "New York",
      postalCode: "10001",
      phone: "(212) 555-1234",
      email: "info@mainstartarts.example.com",
      capacity: 250,
      status: "active",
      managers: ["John Smith", "Jane Doe"],
      operatingHours: "Mon-Fri: 9AM-9PM, Sat-Sun: 10AM-6PM"
    },
    {
      id: 2,
      name: "Westside Community Hall",
      address: "456 West Ave",
      city: "Los Angeles",
      postalCode: "90001",
      phone: "(310) 555-6789",
      email: "contact@westsidehall.example.com",
      capacity: 150,
      status: "active",
      managers: ["Robert Johnson"],
      operatingHours: "Mon-Sun: 8AM-10PM"
    },
    {
      id: 3,
      name: "Harbor View Conference Center",
      address: "789 Harbor Blvd",
      city: "San Francisco",
      postalCode: "94101",
      phone: "(415) 555-9012",
      email: "events@harborview.example.com",
      capacity: 500,
      status: "inactive",
      managers: ["Maria Garcia", "David Chen"],
      operatingHours: "By appointment only"
    },
    {
      id: 4,
      name: "Oakwood Recreation Center",
      address: "321 Oak Lane",
      city: "Chicago",
      postalCode: "60601",
      phone: "(312) 555-3456",
      email: "info@oakwoodrec.example.com",
      capacity: 180,
      status: "maintenance",
      managers: ["Michael Brown"],
      operatingHours: "Temporarily closed for renovations"
    }
  ]);
  
  // New venue form state
  const [newVenue, setNewVenue] = useState<Omit<Venue, 'id'>>({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    email: '',
    capacity: 0,
    status: 'active',
    managers: [],
    operatingHours: ''
  });
  
  // Filter venues based on search query
  const filteredVenues = venues.filter(venue => 
    venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.city.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (activeVenue) {
      setActiveVenue(prev => prev ? { ...prev, [name]: value } : null);
    } else {
      setNewVenue(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle numeric input changes
  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = parseInt(value) || 0;
    
    if (activeVenue) {
      setActiveVenue(prev => prev ? { ...prev, [name]: numericValue } : null);
    } else {
      setNewVenue(prev => ({ ...prev, [name]: numericValue }));
    }
  };
  
  // Handle status change
  const handleStatusChange = (value: string) => {
    if (activeVenue) {
      setActiveVenue(prev => prev ? { 
        ...prev, 
        status: value as 'active' | 'inactive' | 'maintenance' 
      } : null);
    } else {
      setNewVenue(prev => ({ 
        ...prev, 
        status: value as 'active' | 'inactive' | 'maintenance' 
      }));
    }
  };
  
  // Handle managers input
  const handleManagersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const managers = e.target.value.split(',').map(m => m.trim()).filter(Boolean);
    
    if (activeVenue) {
      setActiveVenue(prev => prev ? { ...prev, managers } : null);
    } else {
      setNewVenue(prev => ({ ...prev, managers }));
    }
  };
  
  // Open edit dialog
  const openEditDialog = (venue: Venue) => {
    setActiveVenue({ ...venue });
    setIsEditDialogOpen(true);
  };
  
  // Add a new venue
  const addVenue = () => {
    setIsLoading(true);
    
    // Validation
    if (!newVenue.name || !newVenue.address || !newVenue.city) {
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
      const newId = Math.max(...venues.map(v => v.id), 0) + 1;
      const createdVenue = { ...newVenue, id: newId };
      
      setVenues(prev => [...prev, createdVenue]);
      setIsAddDialogOpen(false);
      setNewVenue({
        name: '',
        address: '',
        city: '',
        postalCode: '',
        phone: '',
        email: '',
        capacity: 0,
        status: 'active',
        managers: [],
        operatingHours: ''
      });
      
      toast({
        title: 'Venue Added',
        description: `${createdVenue.name} has been added successfully`,
      });
      
      setIsLoading(false);
    }, 1000);
  };
  
  // Update a venue
  const updateVenue = () => {
    if (!activeVenue) return;
    
    setIsLoading(true);
    
    // Validation
    if (!activeVenue.name || !activeVenue.address || !activeVenue.city) {
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
      setVenues(prev => 
        prev.map(venue => 
          venue.id === activeVenue.id ? activeVenue : venue
        )
      );
      
      setIsEditDialogOpen(false);
      setActiveVenue(null);
      
      toast({
        title: 'Venue Updated',
        description: `${activeVenue.name} has been updated successfully`,
      });
      
      setIsLoading(false);
    }, 1000);
  };
  
  // Delete a venue
  const deleteVenue = (id: number) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const venueToDelete = venues.find(v => v.id === id);
      setVenues(prev => prev.filter(venue => venue.id !== id));
      
      toast({
        title: 'Venue Deleted',
        description: `${venueToDelete?.name} has been removed`,
        variant: 'default',
      });
      
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <div className="container py-8">
      <Button variant="ghost" className="absolute top-4 left-4 gap-2" onClick={() => navigate('/demo-dashboard')}>
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>
      
      <div className="flex flex-col space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Venues Management</h1>
          <p className="text-muted-foreground">
            Create and manage your organization's locations
          </p>
        </div>
        
        {/* Search and Add section */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search venues..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                <span>Add Venue</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Venue</DialogTitle>
                <DialogDescription>
                  Enter venue details. Required fields are marked with an asterisk (*).
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Venue Name *</Label>
                    <div className="relative">
                      <Input
                        id="name"
                        name="name"
                        value={newVenue.name}
                        onChange={handleInputChange}
                        className="pl-9"
                        placeholder="Enter venue name"
                      />
                      <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      name="capacity"
                      type="number"
                      value={newVenue.capacity || ''}
                      onChange={handleNumericChange}
                      placeholder="Enter capacity"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <div className="relative">
                    <Input
                      id="address"
                      name="address"
                      value={newVenue.address}
                      onChange={handleInputChange}
                      className="pl-9"
                      placeholder="Enter street address"
                    />
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={newVenue.city}
                      onChange={handleInputChange}
                      placeholder="Enter city"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={newVenue.postalCode}
                      onChange={handleInputChange}
                      placeholder="Enter postal code"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        name="phone"
                        value={newVenue.phone}
                        onChange={handleInputChange}
                        className="pl-9"
                        placeholder="Enter phone number"
                      />
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={newVenue.email}
                        onChange={handleInputChange}
                        className="pl-9"
                        placeholder="Enter email address"
                      />
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={newVenue.status} 
                      onValueChange={handleStatusChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="managers">Managers</Label>
                    <div className="relative">
                      <Input
                        id="managers"
                        name="managers"
                        value={newVenue.managers.join(', ')}
                        onChange={handleManagersChange}
                        className="pl-9"
                        placeholder="Enter managers (comma-separated)"
                      />
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="operatingHours">Operating Hours</Label>
                  <div className="relative">
                    <Textarea
                      id="operatingHours"
                      name="operatingHours"
                      value={newVenue.operatingHours}
                      onChange={handleInputChange}
                      className="min-h-[80px] resize-none pl-9"
                      placeholder="Enter operating hours (e.g., Mon-Fri: 9AM-5PM)"
                    />
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addVenue} disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add Venue'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Edit Venue Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Venue</DialogTitle>
                <DialogDescription>
                  Update venue details. Required fields are marked with an asterisk (*).
                </DialogDescription>
              </DialogHeader>
              
              {activeVenue && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Venue Name *</Label>
                      <div className="relative">
                        <Input
                          id="edit-name"
                          name="name"
                          value={activeVenue.name}
                          onChange={handleInputChange}
                          className="pl-9"
                          placeholder="Enter venue name"
                        />
                        <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-capacity">Capacity</Label>
                      <Input
                        id="edit-capacity"
                        name="capacity"
                        type="number"
                        value={activeVenue.capacity || ''}
                        onChange={handleNumericChange}
                        placeholder="Enter capacity"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-address">Address *</Label>
                    <div className="relative">
                      <Input
                        id="edit-address"
                        name="address"
                        value={activeVenue.address}
                        onChange={handleInputChange}
                        className="pl-9"
                        placeholder="Enter street address"
                      />
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-city">City *</Label>
                      <Input
                        id="edit-city"
                        name="city"
                        value={activeVenue.city}
                        onChange={handleInputChange}
                        placeholder="Enter city"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-postalCode">Postal Code</Label>
                      <Input
                        id="edit-postalCode"
                        name="postalCode"
                        value={activeVenue.postalCode}
                        onChange={handleInputChange}
                        placeholder="Enter postal code"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-phone">Phone</Label>
                      <div className="relative">
                        <Input
                          id="edit-phone"
                          name="phone"
                          value={activeVenue.phone}
                          onChange={handleInputChange}
                          className="pl-9"
                          placeholder="Enter phone number"
                        />
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-email">Email</Label>
                      <div className="relative">
                        <Input
                          id="edit-email"
                          name="email"
                          type="email"
                          value={activeVenue.email}
                          onChange={handleInputChange}
                          className="pl-9"
                          placeholder="Enter email address"
                        />
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-status">Status</Label>
                      <Select 
                        value={activeVenue.status} 
                        onValueChange={handleStatusChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-managers">Managers</Label>
                      <div className="relative">
                        <Input
                          id="edit-managers"
                          name="managers"
                          value={activeVenue.managers.join(', ')}
                          onChange={handleManagersChange}
                          className="pl-9"
                          placeholder="Enter managers (comma-separated)"
                        />
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-operatingHours">Operating Hours</Label>
                    <div className="relative">
                      <Textarea
                        id="edit-operatingHours"
                        name="operatingHours"
                        value={activeVenue.operatingHours}
                        onChange={handleInputChange}
                        className="min-h-[80px] resize-none pl-9"
                        placeholder="Enter operating hours (e.g., Mon-Fri: 9AM-5PM)"
                      />
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={updateVenue} disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Venue'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Venues Table */}
        <Card className="overflow-hidden">
          <Table>
            <TableCaption>List of venues in your organization</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Managers</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVenues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No venues found
                  </TableCell>
                </TableRow>
              ) : (
                filteredVenues.map((venue) => (
                  <TableRow key={venue.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{venue.name}</span>
                        {venue.phone && (
                          <span className="text-xs text-muted-foreground">{venue.phone}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{venue.address}</span>
                        <span className="text-xs text-muted-foreground">
                          {venue.city}, {venue.postalCode}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{venue.capacity}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          venue.status === 'active' ? 'default' : 
                          venue.status === 'maintenance' ? 'outline' : 'secondary'
                        }
                      >
                        {venue.status === 'active' ? 'Active' :
                         venue.status === 'maintenance' ? 'Maintenance' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {venue.managers.length > 0 ? (
                        <div className="flex flex-col">
                          {venue.managers.map((manager, index) => (
                            <span key={index} className={index > 0 ? "text-xs text-muted-foreground" : ""}>
                              {manager}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No managers assigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(venue)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit Venue</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteVenue(venue.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete Venue</span>
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
          <h2 className="text-xl font-semibold mb-2">Venue Management Demo</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            This demo showcases the venue management functionality. In a real application,
            this data would be stored in a database and would integrate with your organization's
            administration system.
          </p>
        </div>
      </div>
    </div>
  );
}