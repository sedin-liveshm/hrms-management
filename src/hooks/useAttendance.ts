"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { attendanceService } from "@/services/attendance.service";
import type { AttendanceRecord, AttendanceSummary, AttendanceFilters } from "@/types/attendance";
import { toast } from "sonner";

export function useAttendance(initialFilters?: AttendanceFilters) {
    const { user, role } = useAuth();
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [summary, setSummary] = useState<AttendanceSummary | null>(null);
    const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<AttendanceFilters>(initialFilters || {});

    // Fetch all attendance logs based on filters and roles
    const fetchAttendance = useCallback(async (activeFilters: AttendanceFilters) => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            // Setup base filters depending on role
            const searchFilters: AttendanceFilters = { ...activeFilters };

            // If user is just an employee, they can ONLY see their own records
            if (role === "employee") {
                searchFilters.employeeId = user.uid;
            }

            const data = await attendanceService.getAttendance(searchFilters);
            setAttendance(data);
        } catch (err: any) {
            console.error("fetchAttendance error:", err);
            const msg = err?.message || "Failed to load attendance logs.";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [user, role]);

    // Fetch today's record for check-in/out status
    const fetchTodayRecord = useCallback(async () => {
        if (!user) return;
        try {
            const todayStr = attendanceService.getLocalDateString(new Date());
            const rec = await attendanceService.getAttendanceByUserAndDate(user.uid, todayStr);
            setTodayRecord(rec);
        } catch (err) {
            console.error("Failed to load today's check-in status:", err);
        }
    }, [user]);

    // Fetch summary stats
    const fetchSummary = useCallback(async (activeFilters: AttendanceFilters) => {
        if (!user) return;
        try {
            const targetUid = role === "employee" ? user.uid : activeFilters.employeeId;
            const stats = await attendanceService.getAttendanceSummary(
                targetUid,
                activeFilters.startDate,
                activeFilters.endDate
            );
            setSummary(stats);
        } catch (err) {
            console.error("Failed to load attendance summary:", err);
        }
    }, [user, role]);

    // Combined refresh triggers
    const refresh = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        await Promise.all([
            fetchAttendance(filters),
            fetchTodayRecord(),
            fetchSummary(filters),
        ]);
        setLoading(false);
    }, [user, filters, fetchAttendance, fetchTodayRecord, fetchSummary]);

    // Load initial data
    useEffect(() => {
        if (user) {
            refresh();
        }
    }, [user, filters, refresh]);

    // Check-In Action
    const checkIn = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const rec = await attendanceService.checkIn(
                user.uid,
                user.name || user.displayName || "Employee",
                user.email || "",
            );
            setTodayRecord(rec);
            toast.success("Check In Success! Have a great day ahead.");

            // Refresh list & summary
            await Promise.all([
                fetchAttendance(filters),
                fetchSummary(filters),
            ]);
        } catch (err: any) {
            const msg = err?.message || "Check-In failed. Please try again.";
            toast.error(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Check-Out Action
    const checkOut = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const rec = await attendanceService.checkOut(user.uid);
            setTodayRecord(rec);
            toast.success(`Check Out Success! Total hours worked: ${rec.totalHours} hrs.`);

            // Refresh list & summary
            await Promise.all([
                fetchAttendance(filters),
                fetchSummary(filters),
            ]);
        } catch (err: any) {
            const msg = err?.message || "Check-Out failed. Please try again.";
            toast.error(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Update specific filters and trigger search
    const updateFilters = (newFilters: Partial<AttendanceFilters>) => {
        setFilters((prev) => {
            const updated = { ...prev, ...newFilters };
            // Clear out fields that are empty strings
            if (updated.status === "") delete updated.status;
            if (updated.department === "") delete updated.department;
            return updated;
        });
    };

    // Update attendance record (Admin only)
    const updateRecord = async (id: string, updates: Partial<AttendanceRecord>) => {
        setLoading(true);
        try {
            await attendanceService.updateAttendanceRecord(id, updates);
            toast.success("Attendance record updated successfully.");
            await refresh();
        } catch (err: any) {
            const msg = err?.message || "Failed to update attendance record.";
            toast.error(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        attendance,
        loading,
        error,
        summary,
        todayRecord,
        filters,
        checkIn,
        checkOut,
        refresh,
        updateFilters,
        updateRecord,
    };
}
