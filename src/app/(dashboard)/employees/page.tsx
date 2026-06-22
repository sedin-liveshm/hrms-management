"use client";

import { useState } from "react";
import { Users, UserPlus, RefreshCw } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  SectionCard,
  ErrorState,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useEmployees } from "@/hooks/useEmployees";
import { EmployeeFilters } from "@/components/employee/EmployeeFilters";
import { EmployeeTable } from "@/components/employee/EmployeeTable";
import { EmployeeCard } from "@/components/employee/EmployeeCard";
import { EmployeeForm } from "@/components/employee/EmployeeForm";
import type { Employee } from "@/types/employee";
import type { EmployeeFormValues } from "@/utils/validators";

export default function EmployeesPage() {
  const {
    employees,
    loading,
    error,
    refetch,
    addEmployee,
    editEmployee,
    removeEmployee,
  } = useEmployees();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Dialog State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Handlers for Add/Edit
  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: EmployeeFormValues) => {
    if (editingEmployee) {
      // Edit mode
      await editEmployee(editingEmployee.uid, data);
    } else {
      // Add mode
      await addEmployee(data);
    }
  };

  // Perform client-side search & filtering
  const filteredEmployees = employees.filter((emp) => {
    // 1. Search filter (Name, Employee ID, Email)
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchesName = emp.name?.toLowerCase().includes(q);
      const matchesId = emp.employeeId?.toLowerCase().includes(q);
      const matchesEmail = emp.email?.toLowerCase().includes(q);
      if (!matchesName && !matchesId && !matchesEmail) {
        return false;
      }
    }

    // 2. Department filter
    if (departmentFilter && emp.department !== departmentFilter) {
      return false;
    }

    // 3. System Role filter
    if (roleFilter && emp.role !== roleFilter) {
      return false;
    }

    // 4. Status filter
    if (statusFilter && emp.status !== statusFilter) {
      return false;
    }

    return true;
  });

  return (
    <PageContainer>
      <PageHeader
        title="Employees"
        subtitle="Manage and view your organization's workforce"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={loading}
              className="h-9 rounded-xl cursor-pointer"
              title="Refresh directory"
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            </Button>

            {/* RoleGuard: Only Admin and HR can add employees */}
            <RoleGuard roles={["admin", "hr"]}>
              <Button size="sm" onClick={handleOpenAddModal} className="gap-1.5 h-9 rounded-xl cursor-pointer bg-primary hover:bg-primary/95 text-primary-foreground font-semibold">
                <UserPlus className="size-4" />
                Add Employee
              </Button>
            </RoleGuard>
          </div>
        }
      />

      {error ? (
        <ErrorState
          title="Failed to load employee data"
          description={error}
          onRetry={refetch}
        />
      ) : (
        <SectionCard
          title="All Employees"
          description={`${filteredEmployees.length} profiles matching filters`}
          noPadding
          action={
            <Badge className="bg-primary/10 text-primary border-0 rounded-md font-semibold select-none">
              <Users className="mr-1 size-3.5" />
              {employees.length} Total
            </Badge>
          }
        >
          {/* Search and Filters panel */}
          <div className="border-b border-border p-4 bg-muted/20">
            <EmployeeFilters
              onSearchChange={setSearchQuery}
              onDepartmentChange={setDepartmentFilter}
              onRoleChange={setRoleFilter}
              onStatusChange={setStatusFilter}
              selectedDepartment={departmentFilter}
              selectedRole={roleFilter}
              selectedStatus={statusFilter}
              totalCount={employees.length}
              filteredCount={filteredEmployees.length}
            />
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <EmployeeTable
              data={filteredEmployees}
              isLoading={loading}
              onEdit={handleOpenEditModal}
              onDelete={removeEmployee}
            />
          </div>

          {/* Mobile Card Grid View */}
          <div className="block lg:hidden">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-44 rounded-2xl bg-card border border-border animate-pulse p-5 flex flex-col justify-between">
                    <div className="flex gap-4 items-center">
                      <div className="size-14 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-0.5 bg-border/50 my-2" />
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-5/6" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No employees matching filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                {filteredEmployees.map((emp) => (
                  <EmployeeCard key={emp.uid} employee={emp} />
                ))}
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {/* Reusable Form Dialog for Add/Edit */}
      <EmployeeForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEmployee(null);
        }}
        employee={editingEmployee}
        onSubmit={handleFormSubmit}
      />
    </PageContainer>
  );
}
