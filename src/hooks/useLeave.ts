"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { leaveService } from "@/services/leave.service";
import { employeeService } from "@/services/employee.service";
import type {
    LeaveRequest,
    LeaveSummary,
    LeaveFilters,
    LeaveBalance,
    LeaveType,
} from "@/types/leave";
import { toast } from "sonner";

export function useLeave(initialFilters?: LeaveFilters) {
    const { user, role } = useAuth();
    const [leaveHistory, setLeaveHistory] = useState<LeaveRequest[]>([]);
    const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
    const [summary, setSummary] = useState<LeaveSummary | null>(null);
    const [balances, setBalances] = useState<Record<LeaveType, LeaveBalance> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<LeaveFilters>(initialFilters || {});

    // Fetch leave history list
    const fetchLeaveHistory = useCallback(async (activeFilters: LeaveFilters) => {
        if (!user) return;
        try {
            const searchFilters: LeaveFilters = { ...activeFilters };

            // If role is employee, enforce self-only scope
            if (role === "employee") {
                searchFilters.employeeId = user.uid;
            } else if (role === "manager") {
                const team = await employeeService.getEmployeesByManager(user.employeeId || user.uid);
                const teamUids = team.map(emp => emp.uid || emp.employeeId).filter(Boolean) as string[];
                searchFilters.employeeIds = teamUids;
            }

            const list = await leaveService.getLeaveHistory(searchFilters);
            setLeaveHistory(list);
        } catch (err: any) {
            console.error("fetchLeaveHistory error:", err);
            setError(err?.message || "Failed to load leave history.");
        }
    }, [user, role]);

    // Fetch pending approvals (Manager/HR/Admin only)
    const fetchPendingLeaves = useCallback(async () => {
        if (!user || role === "employee") return;
        try {
            // HR/Admin see all pending, managers only see their team
            const managerId = role === "manager" ? user.uid : undefined;
            const list = await leaveService.getPendingLeaves(managerId);
            setPendingLeaves(list);
        } catch (err) {
            console.error("fetchPendingLeaves error:", err);
        }
    }, [user, role]);

    // Fetch balances (for current user, or filtered user if specified)
    const fetchBalances = useCallback(async (targetUid: string) => {
        try {
            const balMap = await leaveService.getLeaveBalances(targetUid);
            setBalances(balMap);
        } catch (err) {
            console.error("fetchBalances error:", err);
        }
    }, []);

    // Fetch summary counts
    const fetchSummary = useCallback(async (activeFilters: LeaveFilters) => {
        if (!user) return;
        try {
            const isManagerOrHR = role === "manager" || role === "hr" || role === "admin";
            // If we are looking at personal stats, filter by user.uid
            const targetUid = role === "employee" ? user.uid : activeFilters.employeeId;

            const stats = await leaveService.getLeaveSummary(targetUid || user.uid, isManagerOrHR);
            setSummary(stats);
        } catch (err) {
            console.error("fetchSummary error:", err);
        }
    }, [user, role]);

    // Comprehensive refetch
    const refresh = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const targetUid = filters.employeeId || user.uid;
            await Promise.all([
                fetchLeaveHistory(filters),
                fetchPendingLeaves(),
                fetchBalances(targetUid),
                fetchSummary(filters),
            ]);
        } catch (err: any) {
            setError(err?.message || "An error occurred while refreshing leave data.");
        } finally {
            setLoading(false);
        }
    }, [user, filters, fetchLeaveHistory, fetchPendingLeaves, fetchBalances, fetchSummary]);

    // Trigger loading initial data or filter updates
    useEffect(() => {
        if (user) {
            refresh();
        }
    }, [user, filters, refresh]);

    // Apply Leave Action
    const applyLeave = async (
        data: Omit<LeaveRequest, "id" | "status" | "createdAt" | "updatedAt">
    ): Promise<LeaveRequest> => {
        setLoading(true);
        try {
            const request = await leaveService.applyLeave(data);
            toast.success("Leave application submitted successfully!");
            await refresh();
            return request;
        } catch (err: any) {
            const msg = err?.message || "Failed to submit leave application.";
            toast.error(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Approve Leave Action
    const approveLeave = async (leaveId: string, comments?: string): Promise<void> => {
        if (!user) return;
        setLoading(true);
        try {
            const name = user.name || user.displayName || "Manager";
            await leaveService.approveLeave(leaveId, user.uid, name, comments);
            toast.success("Leave request approved successfully!");
            await refresh();
        } catch (err: any) {
            const msg = err?.message || "Failed to approve leave request.";
            toast.error(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Reject Leave Action
    const rejectLeave = async (
        leaveId: string,
        rejectionReason: string,
        comments?: string
    ): Promise<void> => {
        if (!user) return;
        setLoading(true);
        try {
            const name = user.name || user.displayName || "Manager";
            await leaveService.rejectLeave(leaveId, user.uid, name, rejectionReason, comments);
            toast.success("Leave request rejected.");
            await refresh();
        } catch (err: any) {
            const msg = err?.message || "Failed to reject leave request.";
            toast.error(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Cancel Leave Action
    const cancelLeave = async (leaveId: string): Promise<void> => {
        setLoading(true);
        try {
            await leaveService.cancelLeave(leaveId);
            toast.success("Leave request cancelled successfully.");
            await refresh();
        } catch (err: any) {
            const msg = err?.message || "Failed to cancel leave request.";
            toast.error(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Update filter parameters
    const updateFilters = (newFilters: Partial<LeaveFilters>) => {
        setFilters((prev) => {
            const updated = { ...prev, ...newFilters };
            // Delete keys with empty string value
            if (updated.leaveType === "") delete updated.leaveType;
            if (updated.status === "") delete updated.status;
            if (updated.department === "") delete updated.department;
            return updated;
        });
    };

    return {
        leaveHistory,
        pendingLeaves,
        summary,
        balances,
        loading,
        error,
        filters,
        applyLeave,
        approveLeave,
        rejectLeave,
        cancelLeave,
        updateFilters,
        refresh,
    };
}
export default useLeave;
