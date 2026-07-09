import { useState, useEffect, useCallback } from "react";
import { employeeService } from "@/services/employee.service";
import type { Employee } from "@/types/employee";
import { toast } from "sonner";

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await employeeService.getAllEmployees();
      setEmployees(data);
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || "Failed to load employees.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const addEmployee = async (
    data: Omit<Employee, "uid" | "createdAt" | "updatedAt" | "authCreated" | "activatedAt">
  ): Promise<Employee> => {
    try {
      const newEmp = await employeeService.createEmployee(data);
      setEmployees((prev) => [newEmp, ...prev]);
      toast.success("Employee added successfully!");
      return newEmp;
    } catch (err: any) {
      const msg = err?.message || "Failed to add employee.";
      toast.error(msg);
      throw err;
    }
  };

  const editEmployee = async (
    uid: string,
    data: Partial<Employee>
  ): Promise<void> => {
    try {
      await employeeService.updateEmployee(uid, data);
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.uid === uid
            ? { ...emp, ...data, updatedAt: new Date().toISOString() }
            : emp
        )
      );
      toast.success("Employee updated successfully!");
    } catch (err: any) {
      const msg = err?.message || "Failed to update employee.";
      toast.error(msg);
      throw err;
    }
  };

  const removeEmployee = async (uid: string): Promise<void> => {
    try {
      await employeeService.deleteEmployee(uid);
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.uid === uid
            ? {
                ...emp,
                status: "inactive" as const,
                updatedAt: new Date().toISOString(),
              }
            : emp
        )
      );
      toast.success("Employee deactivated successfully!");
    } catch (err: any) {
      const msg = err?.message || "Failed to deactivate employee.";
      toast.error(msg);
      throw err;
    }
  };

  return {
    employees,
    loading,
    error,
    refetch: fetchEmployees,
    addEmployee,
    editEmployee,
    removeEmployee,
  };
}
