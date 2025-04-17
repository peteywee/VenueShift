import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertVenueSchema, Venue } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface VenueFormProps {
  venue?: Venue | null;
  onClose: () => void;
}

export function VenueForm({ venue, onClose }: VenueFormProps) {
  const { toast } = useToast();
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Form setup with zod validation
  const form = useForm({
    resolver: zodResolver(insertVenueSchema),
    defaultValues: {
      name: venue?.name || "",
      address: venue?.address || "",
      description: venue?.description || "",
      coordinates: venue?.coordinates || null,
    },
  });

  // Create venue mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof form.getValues) => {
      const res = await apiRequest("POST", "/api/venues", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/venues"] });
      toast({
        title: "Venue created",
        description: "The venue has been successfully created.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create venue",
        variant: "destructive",
      });
    },
  });

  // Update venue mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; venueData: typeof form.getValues }) => {
      const res = await apiRequest("PATCH", `/api/venues/${data.id}`, data.venueData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/venues"] });
      toast({
        title: "Venue updated",
        description: "The venue has been successfully updated.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update venue",
        variant: "destructive",
      });
    },
  });

  // Get current location
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      setIsGettingLocation(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        form.setValue("coordinates", { lat: latitude, lng: longitude });
        toast({
          title: "Location obtained",
          description: `Latitude: ${latitude.toFixed(6)}, Longitude: ${longitude.toFixed(6)}`,
        });
        setIsGettingLocation(false);
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
      }
    );
  };

  // Form submission handler
  const onSubmit = (data: any) => {
    if (venue) {
      updateMutation.mutate({ id: venue.id, venueData: data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <DialogHeader>
        <DialogTitle>{venue ? 'Edit Venue' : 'Add New Venue'}</DialogTitle>
        <DialogDescription>
          {venue 
            ? 'Update the details for this venue.' 
            : 'Fill in the details to create a new venue.'}
        </DialogDescription>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Venue Name</FormLabel>
                <FormControl>
                  <Input placeholder="Community Center" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St, Anytown, ST 12345" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Provide details about this venue..."
                    className="resize-none min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="coordinates"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coordinates</FormLabel>
                <div className="flex items-start space-x-2">
                  <div className="flex-1">
                    <FormControl>
                      <Input 
                        readOnly
                        value={field.value 
                          ? `Lat: ${field.value.lat?.toFixed(6)}, Lng: ${field.value.lng?.toFixed(6)}` 
                          : "No coordinates set"
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Used for geofencing and location verification
                    </FormDescription>
                  </div>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                  >
                    {isGettingLocation ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Getting...
                      </>
                    ) : (
                      "Get Current"
                    )}
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {venue ? "Updating..." : "Creating..."}
                </>
              ) : (
                venue ? "Update Venue" : "Create Venue"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
