import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Venue } from "@shared/schema";
import { Pencil, Trash2, MapPin, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface VenueListProps {
  venues: Venue[];
  isLoading: boolean;
  onEdit: (venue: Venue) => void;
  onDelete: (venueId: number) => void;
}

export function VenueList({ venues, isLoading, onEdit, onDelete }: VenueListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter venues based on search term
  const filteredVenues = venues.filter(venue => 
    venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.address.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Generate Google Maps URL for the venue's coordinates
  const getMapUrl = (venue: Venue) => {
    if (!venue.coordinates) return null;
    
    const { lat, lng } = venue.coordinates;
    return `https://www.google.com/maps?q=${lat},${lng}`;
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Skeleton className="h-10 w-full" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-48" />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 h-4 w-4" />
        <Input 
          placeholder="Search venues..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {filteredVenues.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-48 p-6">
            <MapPin className="h-12 w-12 text-neutral-400 mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400 text-center">
              {venues.length === 0 
                ? "No venues have been added yet. Create your first venue to get started." 
                : "No venues match your search. Try different keywords."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVenues.map((venue) => (
            <Card key={venue.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                    {venue.name}
                  </h3>
                  
                  <div className="flex items-start mb-3">
                    <MapPin className="h-4 w-4 text-neutral-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 ml-2">
                      {venue.address}
                    </p>
                  </div>
                  
                  {venue.description && (
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-4">
                      {venue.description.length > 100 
                        ? `${venue.description.substring(0, 100)}...` 
                        : venue.description}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onEdit(venue)}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                        onClick={() => onDelete(venue.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                    
                    {venue.coordinates && (
                      <a 
                        href={getMapUrl(venue) || "#"} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary dark:text-primary-light text-sm flex items-center"
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        View Map
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
