import { FilterBar } from "@/components/common";
import type { FilterConfig } from "@/components/common";

interface EmployeeFiltersProps {
    onSearchChange: (search: string) => void;
    onDepartmentChange: (dept: string | null) => void;
    onRoleChange: (role: string | null) => void;
    onStatusChange: (status: string | null) => void;
    selectedDepartment: string | null;
    selectedRole: string | null;
    selectedStatus: string | null;
    totalCount: number;
    filteredCount: number;
    action?: React.ReactNode;
}

export function EmployeeFilters({
    onSearchChange,
    onDepartmentChange,
    onRoleChange,
    onStatusChange,
    selectedDepartment,
    selectedRole,
    selectedStatus,
    totalCount,
    filteredCount,
    action,
}: EmployeeFiltersProps) {

    // List of departments used in the organization
    const departmentOptions = [
        { label: "All Departments", value: "all" },
        { label: "Engineering", value: "Engineering" },
        { label: "Design", value: "Design" },
        { label: "Product", value: "Product" },
        { label: "Human Resources", value: "Human Resources" },
        { label: "IT Administration", value: "IT Administration" },
        { label: "Product Management", value: "Product Management" },
    ];

    // System roles
    const roleOptions = [
        { label: "All Roles", value: "all" },
        { label: "Admin", value: "admin" },
        { label: "HR", value: "hr" },
        { label: "Manager", value: "manager" },
        { label: "Employee", value: "employee" },
    ];

    // Employee status
    const statusOptions = [
        { label: "All Statuses", value: "all" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "On Leave", value: "on-leave" },
    ];

    const filterConfigs: FilterConfig[] = [
        {
            id: "department",
            placeholder: "Department",
            options: departmentOptions,
            onChange: (val) => {
                onDepartmentChange(val === "all" || !val ? null : val);
            },
            defaultValue: selectedDepartment || "all",
        },
        {
            id: "role",
            placeholder: "Role",
            options: roleOptions,
            onChange: (val) => {
                onRoleChange(val === "all" || !val ? null : val);
            },
            defaultValue: selectedRole || "all",
        },
        {
            id: "status",
            placeholder: "Status",
            options: statusOptions,
            onChange: (val) => {
                onStatusChange(val === "all" || !val ? null : val);
            },
            defaultValue: selectedStatus || "all",
        },
    ];

    return (
        <div className="flex flex-col gap-2">
            <FilterBar
                searchPlaceholder="Search by name, ID, or email..."
                onSearch={onSearchChange}
                filters={filterConfigs}
                action={
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                            Showing {filteredCount} of {totalCount}
                        </span>
                        {action}
                    </div>
                }
            />
        </div>
    );
}
