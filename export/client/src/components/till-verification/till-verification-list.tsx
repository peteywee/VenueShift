import { useState } from "react";
import { TillVerification, User, Shift } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Edit, DollarSign, Check, XCircle } from "lucide-react";

interface TillVerificationListProps {
  verifications: TillVerification[];
  isLoading: boolean;
  employees: User[];
  shifts: Shift[];
  onEdit: (verification: TillVerification) => void;
}

export function TillVerificationList({
  verifications,
  isLoading,
  employees,
  shifts,
  onEdit,
}: TillVerificationListProps) {
  const { user } = useAuth();
  const [sortConfig, setSortConfig] = useState<{
    key: keyof TillVerification;
    direction: "ascending" | "descending";
  }>({
    key: "createdAt",
    direction: "descending",
  });

  // Sort verifications
  const sortedVerifications = [...verifications].sort((a, b) => {
    if (a[sortConfig.key] === null) return 1;
    if (b[sortConfig.key] === null) return -1;

    if (sortConfig.key === "createdAt" || sortConfig.key === "verifiedAt") {
      const dateA = a[sortConfig.key] ? new Date(a[sortConfig.key] as Date).getTime() : 0;
      const dateB = b[sortConfig.key] ? new Date(b[sortConfig.key] as Date).getTime() : 0;
      
      return sortConfig.direction === "ascending"
        ? dateA - dateB
        : dateB - dateA;
    }

    const valueA = a[sortConfig.key];
    const valueB = b[sortConfig.key];

    if (valueA === valueB) return 0;

    return sortConfig.direction === "ascending"
      ? valueA < valueB
        ? -1
        : 1
      : valueA < valueB
      ? 1
      : -1;
  });

  // Request sort
  const requestSort = (key: keyof TillVerification) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Helper function to find employee name
  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee ? employee.fullName : "Unknown";
  };

  // Helper function to find verifier name
  const getVerifierName = (verifierId: number | null) => {
    if (!verifierId) return null;
    const verifier = employees.find((e) => e.id === verifierId);
    return verifier ? verifier.fullName : "Unknown";
  };

  // Helper function to find shift info
  const getShiftInfo = (shiftId: number) => {
    const shift = shifts.find((s) => s.id === shiftId);
    if (!shift) return "Unknown Shift";

    const date = new Date(shift.startTime).toLocaleDateString();
    const time = new Date(shift.startTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${date} ${time}`;
  };

  // Format currency display
  const formatCurrency = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  // Can user edit a verification?
  const canEdit = (verification: TillVerification) => {
    if (!user) return false;
    
    // Admin can edit anything
    if (user.role === "admin") return true;
    
    // Employee can only edit their own unverified verifications
    return (
      verification.employeeId === user.id && 
      (verification.verifiedBy === null || verification.verifiedBy === undefined)
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Till Verifications</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
            <span className="ml-2">Loading verifications...</span>
          </div>
        ) : sortedVerifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>No till verifications found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => requestSort("createdAt")}
                  >
                    Date
                    {sortConfig.key === "createdAt" &&
                      (sortConfig.direction === "ascending" ? " ↑" : " ↓")}
                  </TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead className="text-right">Expected</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead
                    className="text-right cursor-pointer"
                    onClick={() => requestSort("discrepancy")}
                  >
                    Discrepancy
                    {sortConfig.key === "discrepancy" &&
                      (sortConfig.direction === "ascending" ? " ↑" : " ↓")}
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedVerifications.map((verification) => (
                  <TableRow key={verification.id}>
                    <TableCell>
                      {new Date(verification.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getShiftInfo(verification.shiftId)}</TableCell>
                    <TableCell>{getEmployeeName(verification.employeeId)}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(verification.expectedAmount)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(verification.actualAmount)}
                    </TableCell>
                    <TableCell 
                      className={`text-right font-mono ${
                        verification.discrepancy < 0
                          ? "text-red-500"
                          : verification.discrepancy > 0
                          ? "text-green-500"
                          : ""
                      }`}
                    >
                      {formatCurrency(verification.discrepancy)}
                    </TableCell>
                    <TableCell>
                      {verification.verifiedBy ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                          <Check className="h-3 w-3 mr-1" />
                          Verified by {getVerifierName(verification.verifiedBy)}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200">
                          <XCircle className="h-3 w-3 mr-1" />
                          Pending verification
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(verification)}
                        disabled={!canEdit(verification)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        {user?.role === "admin" 
                          ? verification.verifiedBy ? "View" : "Verify" 
                          : "Edit"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}