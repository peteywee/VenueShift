import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { EmployeeList } from "@/components/employees/employee-list";
import { EmployeeForm } from "@/components/employees/employee-form";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PlusCircle } from "lucide-react";

export default function Employees() {
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const { toast } = useToast();

  // Fetch employees
  const {
    data: employees = [],
    isLoading,
    error,
  } = useQuery<User[]>({
    queryKey: ["/api/users/employees"],
  });

  // Update employee role mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<User> }) => {
      const res = await apiRequest("PATCH", `/api/users/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/employees"] });
      toast({
        title: "Employee updated",
        description: "The employee has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update employee",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (employee: User) => {
    setEditingEmployee(employee);
    setIsAddEmployeeOpen(true);
  };

  const handleUpdateRole = (employeeId: number, role: string) => {
    updateMutation.mutate({ id: employeeId, data: { role } });
  };

  const handleCloseDialog = () => {
    setIsAddEmployeeOpen(false);
    setEditingEmployee(null);
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
                  Employees
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Manage your organization's staff
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <Button 
                  onClick={() => setIsAddEmployeeOpen(true)} 
                  className="bg-primary hover:bg-primary-dark text-white shadow-sm"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Add Employee
                </Button>
              </div>
            </div>

            {/* Employees List */}
            {error ? (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-800 dark:text-red-200">
                Failed to load employees: {(error as Error).message}
              </div>
            ) : (
              <EmployeeList 
                employees={employees} 
                isLoading={isLoading} 
                onEdit={handleEdit} 
                onUpdateRole={handleUpdateRole} 
              />
            )}
          </div>
        </main>
      </div>

      {/* Add/Edit Employee Dialog */}
      <Dialog open={isAddEmployeeOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <EmployeeForm 
            employee={editingEmployee} 
            onClose={handleCloseDialog} 
          />
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation for Mobile */}
      <MobileNav />
    </div>
  );
}
