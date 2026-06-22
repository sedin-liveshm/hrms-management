"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { PageContainer, PageHeader, ErrorState } from "@/components/common";
import { Button } from "@/components/ui/button";
import { EmployeeDetails } from "@/components/employee/EmployeeDetails";
import { employeeService } from "@/services/employee.service";
import type { Employee } from "@/types/employee";

interface EmployeeDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function EmployeeDetailsPage({
  params,
}: EmployeeDetailsPageProps) {
  const { id } = use(params);
  const router = useRouter();
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployee = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await employeeService.getEmployeeById(id);
      if (!data) {
        setError("Employee profile not found in database.");
      } else {
        setEmployee(data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load employee details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  return (
    <PageContainer>
      <PageHeader
        title={employee ? employee.name : "Employee Details"}
        subtitle={employee ? `Viewing profile details of ${employee.employeeId}` : "Loading profile details..."}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/employees")}
            className="gap-1.5 h-9 rounded-xl cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            Back to Directory
          </Button>
        }
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : error || !employee ? (
        <ErrorState
          title="Employee Profile Error"
          description={error || "Profile does not exist."}
          onRetry={fetchEmployee}
        />
      ) : (
        <EmployeeDetails employee={employee} />
      )}
    </PageContainer>
  );
}
