"use client";

import { useMemo } from "react";
import { DataTable, type Column } from "@/components/common";
import { AttendanceStatusBadge } from "./AttendanceStatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit2, ShieldAlert } from "lucide-react";
import type { AttendanceRecord } from "@/types/attendance";

interface AttendanceTableProps {
    data: AttendanceRecord[];
    isLoading?: boolean;
    showEmployeeColumn?: boolean;
    isAdmin?: boolean;
    onEditClick?: (record: AttendanceRecord) => void;
}

export function AttendanceTable({
    data,
    isLoading = false,
    showEmployeeColumn = false,
    isAdmin = false,
    onEditClick,
}: AttendanceTableProps) {
    // Format YYYY-MM-DD into a readable local date
    const formatDateString = (dateStr: string) => {
        const date = new Date(dateStr);
        // Standard format: Mon, Jun 22, 2026
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    // Format ISO timestamps to local time format: 09:00 AM
    const formatTime = (isoString: string | null) => {
        if (!isoString) return "—";
        const date = new Date(isoString);
        return date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    // Build column configurations based on view role and permissions
    const columns = useMemo(() => {
        const cols: Column<AttendanceRecord>[] = [];

        // 1. Employee Detail Column (shown in Team View)
        if (showEmployeeColumn) {
            cols.push({
                key: "employeeName",
                label: "Employee",
                renderCell: (row) => {
                    const initials = row.employeeName
                        ? row.employeeName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                        : "EMP";

                    return (
                        <div className="flex items-center gap-3">
                            <Avatar className="size-8 text-[10px] font-bold">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                    {initials.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="font-semibold text-foreground text-sm leading-none">
                                    {row.employeeName}
                                </span>
                                <span className="text-[10px] text-muted-foreground mt-0.5">
                                    ID: {row.employeeId} · {row.department}
                                </span>
                            </div>
                        </div>
                    );
                },
            });
        }

        // 2. Date Column
        cols.push({
            key: "date",
            label: "Date",
            renderCell: (row) => (
                <span className="font-medium tabular-nums">{formatDateString(row.date)}</span>
            ),
        });

        // 3. Check-In Column
        cols.push({
            key: "checkIn",
            label: "Check In",
            renderCell: (row) => (
                <span className="font-medium text-muted-foreground tabular-nums text-xs">
                    {formatTime(row.checkIn)}
                </span>
            ),
        });

        // 4. Check-Out Column
        cols.push({
            key: "checkOut",
            label: "Check Out",
            renderCell: (row) => (
                <span className="font-medium text-muted-foreground tabular-nums text-xs">
                    {formatTime(row.checkOut)}
                </span>
            ),
        });

        // 5. Total Hours Column
        cols.push({
            key: "totalHours",
            label: "Total Hours",
            renderCell: (row) => (
                <span className="font-bold text-foreground tabular-nums">
                    {row.totalHours !== null ? `${row.totalHours} hrs` : "—"}
                </span>
            ),
        });

        // 6. Status Column
        cols.push({
            key: "status",
            label: "Status",
            renderCell: (row) => <AttendanceStatusBadge status={row.status} />,
        });

        // 7. Actions Column (Admin only)
        if (isAdmin && onEditClick) {
            cols.push({
                key: "actions",
                label: "Actions",
                align: "right",
                renderCell: (row) => (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditClick(row)}
                        className="size-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                        title="Edit Attendance Record"
                    >
                        <Edit2 className="size-4" />
                    </Button>
                ),
            });
        }

        return cols;
    }, [showEmployeeColumn, isAdmin, onEditClick]);

    return (
        <div className="bg-white rounded-xl shadow-none dark:bg-card border border-border overflow-hidden">
            <DataTable
                columns={columns}
                data={data}
                rowKey="id"
                isLoading={isLoading}
                skeletonRows={5}
                emptyTitle="No attendance logs found"
                emptyDescription="We couldn't find any attendance logs matching your current filters."
            />
        </div>
    );
}
