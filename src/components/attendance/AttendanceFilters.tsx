"use client";

import { useEmployees } from "@/hooks/useEmployees";
import { AttendanceStatus, type AttendanceFilters as FiltersType } from "@/types/attendance";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw, Calendar } from "lucide-react";

// Local styled Label component
const Label = (props: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label
    {...props}
    className="text-xs font-semibold text-muted-foreground uppercase leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  />
);

interface AttendanceFiltersProps {
  filters: FiltersType;
  onFilterChange: (filters: Partial<FiltersType>) => void;
  showEmployeeFilter?: boolean;
}

export function AttendanceFilters({
  filters,
  onFilterChange,
  showEmployeeFilter = false,
}: AttendanceFiltersProps) {
  const { employees } = useEmployees();

  // Reset all filters
  const handleClearFilters = () => {
    onFilterChange({
      startDate: "",
      endDate: "",
      employeeId: "",
      status: "",
      department: "",
      search: "",
    });
  };

  const departments = [
    "Engineering",
    "Product Management",
    "Product",
    "Human Resources",
    "Design",
    "IT Administration",
  ];

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm border border-border dark:bg-card">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {/* Search Filter */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="search" className="text-xs font-semibold text-muted-foreground uppercase">
            Search Employee
          </Label>
          <div className="relative">
            <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder="Name or ID..."
              value={filters.search || ""}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="pl-9 h-9 rounded-xl text-sm border-border bg-transparent focus:ring-primary"
            />
          </div>
        </div>

        {/* Date Range - Start Date */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="startDate" className="text-xs font-semibold text-muted-foreground uppercase">
            Start Date
          </Label>
          <div className="relative">
            <Calendar className="absolute top-2.5 left-3 size-4 text-muted-foreground pointer-events-none" />
            <Input
              id="startDate"
              type="date"
              value={filters.startDate || ""}
              onChange={(e) => onFilterChange({ startDate: e.target.value })}
              className="pl-9 h-9 rounded-xl text-sm border-border bg-transparent focus:ring-primary"
            />
          </div>
        </div>

        {/* Date Range - End Date */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="endDate" className="text-xs font-semibold text-muted-foreground uppercase">
            End Date
          </Label>
          <div className="relative">
            <Calendar className="absolute top-2.5 left-3 size-4 text-muted-foreground pointer-events-none" />
            <Input
              id="endDate"
              type="date"
              value={filters.endDate || ""}
              onChange={(e) => onFilterChange({ endDate: e.target.value })}
              className="pl-9 h-9 rounded-xl text-sm border-border bg-transparent focus:ring-primary"
            />
          </div>
        </div>

        {/* Department Filter */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-dept" className="text-xs font-semibold text-muted-foreground uppercase">
            Department
          </Label>
          <Select
            value={filters.department || "all"}
            onValueChange={(val) => onFilterChange({ department: val === "all" || val === null ? undefined : val })}
          >
            <SelectTrigger id="filter-dept" className="h-9 rounded-xl text-sm border-border bg-transparent">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-status" className="text-xs font-semibold text-muted-foreground uppercase">
            Status
          </Label>
          <Select
            value={filters.status || "all"}
            onValueChange={(val) => onFilterChange({ status: val === "all" ? "" : (val as AttendanceStatus) })}
          >
            <SelectTrigger id="filter-status" className="h-9 rounded-xl text-sm border-border bg-transparent">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.values(AttendanceStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Second Row: Optional Employee Selector + Reset */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-dashed border-border/80 pt-3">
        {showEmployeeFilter ? (
          <div className="flex flex-1 flex-col gap-1.5 max-w-xs">
            <Label htmlFor="filter-employee" className="text-xs font-semibold text-muted-foreground uppercase">
              Filter by Employee
            </Label>
            <Select
              value={filters.employeeId || "all"}
              onValueChange={(val) => onFilterChange({ employeeId: val === "all" || val === null ? undefined : val })}
            >
              <SelectTrigger id="filter-employee" className="h-9 rounded-xl text-sm border-border bg-transparent">
                <SelectValue placeholder="Select Employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {employees
                  .filter((emp) => emp.status === "active")
                  .map((emp) => (
                    <SelectItem key={emp.uid} value={emp.uid}>
                      {emp.name} ({emp.employeeId})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="flex-1 text-xs text-muted-foreground">
            Active filters are automatically combined.
          </div>
        )}

        <Button
          variant="outline"
          onClick={handleClearFilters}
          className="h-9 text-xs rounded-xl border-border px-3 shrink-0 ml-auto hover:bg-muted"
        >
          <RotateCcw className="mr-1.5 size-3.5" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
