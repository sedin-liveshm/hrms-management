"use client";

import { DataTable, type Column } from "@/components/common/DataTable";
import { LeaveStatusBadge } from "./LeaveStatusBadge";
import { LEAVE_TYPE_LABELS, type LeaveRequest } from "@/types/leave";
import { format } from "date-fns";
import { Eye, Check, X, Ban, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

interface LeaveTableProps {
  data: LeaveRequest[];
  isLoading?: boolean;
  onViewDetails: (leave: LeaveRequest) => void;
  onApprove?: (leave: LeaveRequest) => void;
  onReject?: (leave: LeaveRequest) => void;
  onCancel?: (leave: LeaveRequest) => void;
  showEmployeeColumn?: boolean;
}

export function LeaveTable({
  data,
  isLoading = false,
  onViewDetails,
  onApprove,
  onReject,
  onCancel,
  showEmployeeColumn = false,
}: LeaveTableProps) {
  const { user, role } = useAuth();

  // Helper to convert Firestore Timestamps safely
  const toDate = (ts: any): Date => {
    if (!ts) return new Date();
    if (ts instanceof Date) return ts;
    if (typeof ts.toDate === "function") return ts.toDate();
    if (typeof ts.seconds === "number") return new Date(ts.seconds * 1000);
    return new Date(ts);
  };

  const columns: Column<LeaveRequest>[] = [];

  // Employee details columns (only visible in Manager/HR/Admin team views)
  if (showEmployeeColumn) {
    columns.push({
      key: "employeeName",
      label: "Employee",
      renderCell: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-xs">{row.employeeName}</span>
          <span className="text-[10px] text-muted-foreground">{row.designation} · {row.department}</span>
        </div>
      ),
    });
  }

  // Common Columns
  columns.push(
    {
      key: "createdAt",
      label: "Applied Date",
      renderCell: (row) => (
        <span className="text-xs text-muted-foreground">
          {format(toDate(row.createdAt), "dd MMM yyyy")}
        </span>
      ),
    },
    {
      key: "leaveType",
      label: "Leave Type",
      renderCell: (row) => (
        <span className="font-medium text-xs text-foreground">
          {LEAVE_TYPE_LABELS[row.leaveType]}
        </span>
      ),
    },
    {
      key: "duration",
      label: "Duration",
      renderCell: (row) => {
        const start = toDate(row.startDate);
        const end = toDate(row.endDate);
        return (
          <div className="flex flex-col text-xs">
            <span className="font-medium text-foreground">
              {row.totalDays} Day{row.totalDays > 1 ? "s" : ""}
              {row.halfDay && " (Half)"}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {format(start, "dd MMM")} - {format(end, "dd MMM yyyy")}
            </span>
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      renderCell: (row) => <LeaveStatusBadge status={row.status} />,
    },
    {
      key: "approvedByName",
      label: "Approver",
      renderCell: (row) => {
        if (row.status === "cancelled") {
          return <span className="text-xs text-muted-foreground italic">Cancelled</span>;
        }
        if (row.approvedByName) {
          return (
            <div className="flex flex-col text-xs">
              <span className="font-medium text-foreground">{row.approvedByName}</span>
              <span className="text-[10px] text-muted-foreground">
                {row.approvedAt ? format(toDate(row.approvedAt), "dd MMM yyyy") : ""}
              </span>
            </div>
          );
        }
        return <span className="text-xs text-muted-foreground italic">Pending Approval</span>;
      },
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      width: "80px",
      renderCell: (row) => {
        const isRequester = user?.uid === row.uid;
        const isManagerOrHR = role === "manager" || role === "hr" || role === "admin";
        
        // Actions conditions
        const showCancel = isRequester && row.status === "pending";
        const showApproveReject = isManagerOrHR && row.status === "pending" && !isRequester;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex size-8 items-center justify-center rounded-lg p-0 cursor-pointer hover:bg-muted/85 text-muted-foreground hover:text-foreground focus-visible:outline-hidden" aria-label="Open Actions Menu">
              <span className="sr-only">Open Actions Menu</span>
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs">
              <DropdownMenuItem onClick={() => onViewDetails(row)} className="gap-2 cursor-pointer text-xs">
                <Eye className="size-3.5" />
                View Details
              </DropdownMenuItem>

              {showApproveReject && onApprove && (
                <DropdownMenuItem
                  onClick={() => onApprove(row)}
                  className="gap-2 cursor-pointer text-emerald-600 focus:text-emerald-600 font-medium text-xs"
                >
                  <Check className="size-3.5" />
                  Approve Request
                </DropdownMenuItem>
              )}

              {showApproveReject && onReject && (
                <DropdownMenuItem
                  onClick={() => onReject(row)}
                  className="gap-2 cursor-pointer text-destructive focus:text-destructive font-medium text-xs"
                >
                  <X className="size-3.5" />
                  Reject Request
                </DropdownMenuItem>
              )}

              {showCancel && onCancel && (
                <DropdownMenuItem
                  onClick={() => onCancel(row)}
                  className="gap-2 cursor-pointer text-destructive focus:text-destructive text-xs"
                >
                  <Ban className="size-3.5" />
                  Cancel Request
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey="id"
      isLoading={isLoading}
      skeletonRows={5}
      emptyTitle="No Leave Requests Found"
      emptyDescription="There are no leave requests matching the active filters."
      onRowClick={onViewDetails}
    />
  );
}

export default LeaveTable;
