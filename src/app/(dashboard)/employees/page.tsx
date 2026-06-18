"use client";

import { useState } from "react";
import { Users, UserPlus } from "lucide-react";
import { PageContainer, PageHeader, SectionCard, FilterBar, DataTable } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  status: "Active" | "Inactive" | "On Leave";
  joinDate: string;
}

const mockEmployees: Employee[] = [
  { id: "1", name: "Ananya Krishnan", role: "Software Engineer", department: "Engineering", status: "Active", joinDate: "2023-01-15" },
  { id: "2", name: "Rahul Sharma", role: "Product Manager", department: "Product", status: "Active", joinDate: "2022-08-01" },
  { id: "3", name: "Priya Nair", role: "UI Designer", department: "Design", status: "On Leave", joinDate: "2023-03-20" },
  { id: "4", name: "Karthik Raja", role: "DevOps Engineer", department: "Engineering", status: "Active", joinDate: "2021-11-10" },
  { id: "5", name: "Sneha Patel", role: "HR Specialist", department: "Human Resources", status: "Active", joinDate: "2022-05-18" },
];

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = mockEmployees.filter(
    (e) =>
      searchQuery === "" ||
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer>
      <PageHeader
        title="Employees"
        subtitle="Manage your organization's workforce"
        action={
          <Button size="sm" className="gap-1.5">
            <UserPlus className="size-4" />
            Add Employee
          </Button>
        }
      />
      <SectionCard
        title="All Employees"
        description={`${filtered.length} employees found`}
        noPadding
        action={
          <Badge className="bg-primary/10 text-primary border-0">
            <Users className="mr-1 size-3" />
            {mockEmployees.length} total
          </Badge>
        }
      >
        <div className="border-b border-border p-4">
          <FilterBar
            searchPlaceholder="Search employees..."
            onSearch={setSearchQuery}
            filters={[
              {
                id: "department",
                placeholder: "All Departments",
                onChange: () => {},
                options: [
                  { label: "Engineering", value: "engineering" },
                  { label: "Product", value: "product" },
                  { label: "Design", value: "design" },
                  { label: "Human Resources", value: "hr" },
                ],
              },
              {
                id: "status",
                placeholder: "All Status",
                onChange: () => {},
                options: [
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                  { label: "On Leave", value: "on-leave" },
                ],
              },
            ]}
          />
        </div>
        <DataTable
          data={filtered}
          rowKey="id"
          columns={[
            {
              key: "name",
              label: "Employee",
              renderCell: (row) => (
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-secondary/10 text-xs font-semibold text-secondary">
                      {row.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{row.name}</p>
                    <p className="text-xs text-muted-foreground">{row.role}</p>
                  </div>
                </div>
              ),
            },
            { key: "department", label: "Department" },
            { key: "joinDate", label: "Join Date" },
            {
              key: "status",
              label: "Status",
              renderCell: (row) => (
                <Badge
                  className={
                    row.status === "Active"
                      ? "bg-primary/10 text-primary border-0"
                      : row.status === "On Leave"
                      ? "bg-amber-50 text-amber-600 border-0"
                      : "bg-muted text-muted-foreground border-0"
                  }
                >
                  {row.status}
                </Badge>
              ),
            },
          ]}
        />
      </SectionCard>
    </PageContainer>
  );
}
