"use client";

import { SearchInput } from "@/components/common";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { LEAVE_TYPE_LABELS, type LeaveFilters as LeaveFiltersType, type LeaveType, type LeaveStatus } from "@/types/leave";
import { X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeaveFiltersProps {
  filters: LeaveFiltersType;
  onFilterChange: (newFilters: Partial<LeaveFiltersType>) => void;
  showTeamFilters?: boolean;
}

export function LeaveFilters({
  filters,
  onFilterChange,
  showTeamFilters = false,
}: LeaveFiltersProps) {
  // Reset all filters
  const handleClearFilters = () => {
    onFilterChange({
      startDate: "",
      endDate: "",
      leaveType: "",
      status: "",
      department: "",
      search: "",
    });
  };

  const hasActiveFilters = 
    !!filters.startDate || 
    !!filters.endDate || 
    !!filters.leaveType || 
    !!filters.status || 
    !!filters.department || 
    !!filters.search;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search for Employee name - Only for Manager/HR/Admin */}
        {showTeamFilters && (
          <SearchInput
            placeholder="Search employee name..."
            onSearch={(val) => onFilterChange({ search: val })}
            className="w-full sm:w-60"
          />
        )}

        {/* Leave Type Select */}
        <Select
          value={filters.leaveType || "all"}
          onValueChange={(val) => onFilterChange({ leaveType: val === "all" || !val ? "" : (val as LeaveType) })}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Leave Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Leave Types</SelectItem>
            {Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Select */}
        <Select
          value={filters.status || "all"}
          onValueChange={(val) => onFilterChange({ status: val === "all" || !val ? "" : (val as LeaveStatus) })}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {/* Department - Only for Team view */}
        {showTeamFilters && (
          <Select
            value={filters.department || "all"}
            onValueChange={(val) => onFilterChange({ department: val === "all" || !val ? undefined : val })}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="human resources">Human Resources</SelectItem>
              <SelectItem value="product management">Product Management</SelectItem>
              <SelectItem value="product">Product</SelectItem>
              <SelectItem value="it administration">IT Administration</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Date Filters Wrapper */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex items-center w-full sm:w-auto">
            <Input
              type="date"
              aria-label="Start Date"
              value={filters.startDate || ""}
              onChange={(e) => onFilterChange({ startDate: e.target.value })}
              className="pl-8 w-full sm:w-36 text-xs h-9"
            />
            <Calendar className="absolute left-2.5 size-4 text-muted-foreground pointer-events-none" />
          </div>
          <span className="text-muted-foreground text-xs font-medium">to</span>
          <div className="relative flex items-center w-full sm:w-auto">
            <Input
              type="date"
              aria-label="End Date"
              value={filters.endDate || ""}
              onChange={(e) => onFilterChange({ endDate: e.target.value })}
              className="pl-8 w-full sm:w-36 text-xs h-9"
            />
            <Calendar className="absolute left-2.5 size-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-xs h-9 px-2 text-muted-foreground hover:text-foreground gap-1.5"
          >
            <X className="size-3.5" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

export default LeaveFilters;
