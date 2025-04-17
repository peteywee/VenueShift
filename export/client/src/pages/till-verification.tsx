import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TillVerification, User, Shift } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getQueryFn } from "@/lib/queryClient";
import { TillVerificationList } from "@/components/till-verification/till-verification-list";
import { TillVerificationForm } from "@/components/till-verification/till-verification-form";
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  PageHeader, 
  PageHeaderDescription, 
  PageHeaderHeading 
} from "@/components/page-header";
import { Loader2, Plus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function TillVerificationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<TillVerification | null>(null);

  // Fetch till verifications
  const { 
    data: verifications = [], 
    isLoading: isLoadingVerifications,
    error: verificationsError
  } = useQuery<TillVerification[], Error>({
    queryKey: ["/api/till-verifications"],
    queryFn: getQueryFn(),
  });

  // Fetch employees for dropdown
  const { 
    data: employees = [], 
    isLoading: isLoadingEmployees,
    error: employeesError
  } = useQuery<User[], Error>({
    queryKey: ["/api/users"],
    queryFn: getQueryFn(),
  });

  // Fetch shifts for dropdown
  const { 
    data: shifts = [], 
    isLoading: isLoadingShifts,
    error: shiftsError
  } = useQuery<Shift[], Error>({
    queryKey: ["/api/shifts"],
    queryFn: getQueryFn(),
  });

  // Handle opening the edit dialog
  const handleEdit = (verification: TillVerification) => {
    setSelectedVerification(verification);
    setOpen(true);
  };

  // Handle dialog close
  const handleClose = () => {
    setOpen(false);
    // Clear the selected verification after the dialog animation completes
    setTimeout(() => {
      setSelectedVerification(null);
    }, 300);
  };

  // Get loading state
  const isLoading = isLoadingVerifications || isLoadingEmployees || isLoadingShifts;

  // Handle errors
  const error = verificationsError || employeesError || shiftsError;
  if (error) {
    console.error("Error loading data:", error);
    toast({
      title: "Error loading data",
      description: error.message,
      variant: "destructive",
    });
  }

  return (
    <div className="container py-4 md:py-8 space-y-6">
      <PageHeader>
        <PageHeaderHeading>Till Verification</PageHeaderHeading>
        <PageHeaderDescription>
          Manage end-of-shift till reconciliation and verifications
        </PageHeaderDescription>
      </PageHeader>

      <div className="flex justify-between items-center">
        <div>
          {isLoading ? (
            <div className="flex items-center text-muted-foreground">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading data...
            </div>
          ) : (
            <p className="text-muted-foreground">
              {verifications.length} verification{verifications.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Verification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <TillVerificationForm
              tillVerification={selectedVerification}
              shifts={shifts}
              employees={employees}
              onClose={handleClose}
              currentUser={user}
            />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error.message}
          </AlertDescription>
        </Alert>
      )}

      <TillVerificationList
        verifications={verifications}
        isLoading={isLoading}
        employees={employees}
        shifts={shifts}
        onEdit={handleEdit}
      />
    </div>
  );
}