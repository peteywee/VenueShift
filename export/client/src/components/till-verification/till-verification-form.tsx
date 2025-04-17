import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { TillVerification, User, Shift } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TillVerificationFormProps {
  tillVerification?: TillVerification | null;
  shifts: Shift[];
  employees: User[];
  onClose: () => void;
  currentUser: User | null;
}

// Form schema for till verification
const tillVerificationSchema = z.object({
  shiftId: z.string().min(1, "Shift is required"),
  employeeId: z.string().min(1, "Employee is required"),
  expectedAmount: z.coerce.number().min(0, "Expected amount must be a positive number"),
  actualAmount: z.coerce.number().min(0, "Actual amount must be a positive number"),
  notes: z.string().optional(),
  verifiedBy: z.boolean().optional(),
});

type TillVerificationFormValues = z.infer<typeof tillVerificationSchema>;

export function TillVerificationForm({
  tillVerification,
  shifts,
  employees,
  onClose,
  currentUser,
}: TillVerificationFormProps) {
  const { toast } = useToast();
  const [discrepancy, setDiscrepancy] = useState(
    tillVerification ? tillVerification.discrepancy : 0
  );

  // Set default values for the form
  const defaultValues: Partial<TillVerificationFormValues> = tillVerification
    ? {
        shiftId: tillVerification.shiftId.toString(),
        employeeId: tillVerification.employeeId.toString(),
        expectedAmount: tillVerification.expectedAmount / 100, // Convert cents to dollars for display
        actualAmount: tillVerification.actualAmount / 100, // Convert cents to dollars for display
        notes: tillVerification.notes || "",
        verifiedBy: !!tillVerification.verifiedBy,
      }
    : {
        shiftId: "",
        employeeId: currentUser ? currentUser.id.toString() : "",
        expectedAmount: 0,
        actualAmount: 0,
        notes: "",
        verifiedBy: false,
      };

  // Create form
  const form = useForm<TillVerificationFormValues>({
    resolver: zodResolver(tillVerificationSchema),
    defaultValues,
    mode: "onChange",
  });

  // Watch amount fields to calculate discrepancy
  const expectedAmount = form.watch("expectedAmount");
  const actualAmount = form.watch("actualAmount");

  // Calculate and display discrepancy when either amount changes
  useEffect(() => {
    if (expectedAmount !== undefined && actualAmount !== undefined) {
      const newDiscrepancy = (actualAmount - expectedAmount) * 100; // Store as cents
      setDiscrepancy(newDiscrepancy);
    }
  }, [expectedAmount, actualAmount]);

  // Create mutation for creating a new verification
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/till-verifications", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/till-verifications"] });
      toast({
        title: "Success",
        description: "Till verification created successfully",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create till verification: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update mutation for updating an existing verification
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest(
        "PATCH",
        `/api/till-verifications/${tillVerification?.id}`,
        data
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/till-verifications"] });
      toast({
        title: "Success",
        description: "Till verification updated successfully",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update till verification: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Submit handler
  const onSubmit = (data: TillVerificationFormValues) => {
    // Convert dollar amounts to cents for storage
    const formattedData = {
      ...data,
      employeeId: parseInt(data.employeeId),
      shiftId: parseInt(data.shiftId),
      expectedAmount: Math.round(data.expectedAmount * 100), // Convert to cents
      actualAmount: Math.round(data.actualAmount * 100), // Convert to cents
    };

    if (tillVerification) {
      updateMutation.mutate(formattedData);
    } else {
      createMutation.mutate(formattedData);
    }
  };

  // Format shift display
  const formatShiftDisplay = (shift: Shift) => {
    const date = new Date(shift.startTime).toLocaleDateString();
    const startTime = new Date(shift.startTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const endTime = new Date(shift.endTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    
    // Find employee name
    const employee = employees.find(e => e.id === shift.employeeId);
    
    return `${date} (${startTime}-${endTime}) ${employee ? '- ' + employee.fullName : ''}`;
  };

  // Is this user allowed to verify (admin only)
  const canVerify = currentUser?.role === "admin";
  
  // Is this already verified?
  const isVerified = tillVerification?.verifiedBy !== null && 
                     tillVerification?.verifiedBy !== undefined;

  // Get filtered shifts for the current employee if they're not an admin
  const filteredShifts = currentUser?.role === "admin" 
    ? shifts 
    : shifts.filter(shift => shift.employeeId === currentUser?.id);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {tillVerification ? "Edit Till Verification" : "New Till Verification"}
        </CardTitle>
        <CardDescription>
          {tillVerification
            ? "Update the details of the till verification"
            : "Record the end-of-shift till count"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="shiftId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shift</FormLabel>
                  <Select
                    disabled={isVerified || form.formState.isSubmitting}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a shift" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredShifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id.toString()}>
                          {formatShiftDisplay(shift)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select
                    disabled={
                      !canVerify || 
                      isVerified || 
                      form.formState.isSubmitting
                    }
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem
                          key={employee.id}
                          value={employee.id.toString()}
                        >
                          {employee.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expectedAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Amount ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        disabled={isVerified || form.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="actualAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Amount ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        disabled={isVerified || form.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-secondary/50 p-4 rounded-md">
              <Label>Discrepancy</Label>
              <div className={`text-xl font-bold ${discrepancy < 0 ? 'text-red-500' : discrepancy > 0 ? 'text-green-500' : ''}`}>
                ${(discrepancy / 100).toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                {discrepancy < 0
                  ? "Till is short"
                  : discrepancy > 0
                  ? "Till is over"
                  : "No discrepancy"}
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={
                        isVerified && currentUser?.role !== "admin" || 
                        form.formState.isSubmitting
                      }
                      placeholder="Add any notes about the verification..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {canVerify && (
              <FormField
                control={form.control}
                name="verifiedBy"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        disabled={form.formState.isSubmitting}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Verify as administrator</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        I have checked this till verification and confirm it is accurate
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={form.handleSubmit(onSubmit)}
          disabled={form.formState.isSubmitting || isVerified}
        >
          {form.formState.isSubmitting ? (
            <>Saving...</>
          ) : tillVerification ? (
            "Update"
          ) : (
            "Save"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}