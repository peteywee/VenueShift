import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { VenueList } from "@/components/venues/venue-list";
import { VenueForm } from "@/components/venues/venue-form";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Venue } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PlusCircle } from "lucide-react";

export default function Venues() {
  const [isAddVenueOpen, setIsAddVenueOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const { toast } = useToast();

  // Fetch venues
  const {
    data: venues = [],
    isLoading,
    error,
  } = useQuery<Venue[]>({
    queryKey: ["/api/venues"],
  });

  // Delete venue mutation
  const deleteMutation = useMutation({
    mutationFn: async (venueId: number) => {
      await apiRequest("DELETE", `/api/venues/${venueId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/venues"] });
      toast({
        title: "Venue deleted",
        description: "The venue has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete venue",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (venue: Venue) => {
    setEditingVenue(venue);
    setIsAddVenueOpen(true);
  };

  const handleDelete = (venueId: number) => {
    if (window.confirm("Are you sure you want to delete this venue?")) {
      deleteMutation.mutate(venueId);
    }
  };

  const handleCloseDialog = () => {
    setIsAddVenueOpen(false);
    setEditingVenue(null);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <Header />

      {/* Main Content Area */}
      <div className="pt-16 pb-16 lg:pl-64 min-h-screen flex flex-col">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 z-10">
          <Sidebar />
        </div>

        {/* Page Content */}
        <main className="flex-1 px-4 py-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                  Venues
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Manage your organization's venues
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <Button 
                  onClick={() => setIsAddVenueOpen(true)} 
                  className="bg-primary hover:bg-primary-dark text-white shadow-sm"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Add Venue
                </Button>
              </div>
            </div>

            {/* Venues List */}
            {error ? (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-800 dark:text-red-200">
                Failed to load venues: {(error as Error).message}
              </div>
            ) : (
              <VenueList 
                venues={venues} 
                isLoading={isLoading} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
              />
            )}
          </div>
        </main>
      </div>

      {/* Add/Edit Venue Dialog */}
      <Dialog open={isAddVenueOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <VenueForm 
            venue={editingVenue} 
            onClose={handleCloseDialog} 
          />
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation for Mobile */}
      <MobileNav />
    </div>
  );
}
