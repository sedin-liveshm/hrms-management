import { db } from "@/firebase/firestore";
import { isFirebaseConfigured } from "@/firebase/config";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    Timestamp,
} from "firebase/firestore";
import type {
    LeaveRequest,
    LeaveFilters,
    LeaveType,
    LeaveStatus,
    LeaveSummary,
    LeaveBalance,
} from "@/types/leave";
import { differenceInCalendarDays } from "date-fns";

class LeaveService {
    private isFirebaseEnabled(): boolean {
        return isFirebaseConfigured && db !== null;
    }
    /**
     * Date string helper YYYY-MM-DD
     */
    public getLocalDateString(date: Date = new Date()): string {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }
    /**
     * Convert Firestore Timestamp or serialized representation to JS Date
     */
    public toDate(
        ts: Timestamp | { seconds: number; nanoseconds: number } | string | Date | null | undefined
    ): Date {
        if (!ts) return new Date();
        if (ts instanceof Date) return ts;
        if (typeof ts === "string") return new Date(ts);
        if (typeof (ts as any).toDate === "function") return (ts as any).toDate();
        if (typeof (ts as any).seconds === "number") return new Date((ts as any).seconds * 1000);
        return new Date(ts as any);
    }
    /**
     * Helper to construct a standard Timestamp structure
     */
    private createTimestamp(date: Date): Timestamp {
        if (this.isFirebaseEnabled()) {
            return Timestamp.fromDate(date);
        } else {
            const sec = Math.floor(date.getTime() / 1000);
            return {
                seconds: sec,
                nanoseconds: 0,
                toDate: () => date,
                isEqual: (other: any) => other && other.seconds === sec,
                valueOf: () => `${sec}`,
            } as any;
        }
    }
    /**
     * Expose a helper to calculate total working days (excluding weekends)
     */
    public calculateTotalDays(start: Date, end: Date, halfDay: boolean): number {
        if (halfDay) return 0.5;

        // Standard organization work day calculation: exclude Sat (6) and Sun (0)
        let count = 0;
        const curDate = new Date(start.getTime());
        // Clear times to compare dates safely
        curDate.setHours(0, 0, 0, 0);
        const endDate = new Date(end.getTime());
        endDate.setHours(0, 0, 0, 0);

        while (curDate <= endDate) {
            const dayOfWeek = curDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                count++;
            }
            curDate.setDate(curDate.getDate() + 1);
        }
        return count > 0 ? count : differenceInCalendarDays(end, start) + 1;
    }

    /**
     * Applies for a leave request. Includes validations:
     * - No past dates
     * - No overlapping requests
     * - No duplicates
     */
    public async applyLeave(
        data: Omit<LeaveRequest, "id" | "status" | "createdAt" | "updatedAt">
    ): Promise<LeaveRequest> {
        const start = this.toDate(data.startDate);
        const end = this.toDate(data.endDate);
        const now = new Date();

        // 1. Validation: Prevent past leaves (cannot start before today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const compareStart = new Date(start);
        compareStart.setHours(0, 0, 0, 0);
        if (compareStart < today) {
            throw new Error("Cannot apply for leave in past dates.");
        }

        // 2. Validation: Start date <= End date
        if (start > end) {
            throw new Error("Start Date cannot be after End Date.");
        }

        // 3. Validation: Overlapping leaves & duplicates
        const existingRequests = await this.getLeavesByEmployee(data.uid);
        const hasOverlap = existingRequests.some((existing) => {
            // Ignore rejected or cancelled requests
            if (existing.status === "rejected" || existing.status === "cancelled") {
                return false;
            }
            const existingStart = this.toDate(existing.startDate);
            const existingEnd = this.toDate(existing.endDate);

            // Check overlap: Start A <= End B && End A >= Start B
            return start <= existingEnd && end >= existingStart;
        });

        if (hasOverlap) {
            throw new Error("You have an overlapping leave request during this period.");
        }

        const leaveId = `leave-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const nowTimestamp = this.createTimestamp(now);

        const newRequest: LeaveRequest = {
            ...data,
            id: leaveId,
            status: "pending",
            createdAt: nowTimestamp,
            updatedAt: nowTimestamp,
        };

        if (this.isFirebaseEnabled()) {
            try {
                const docRef = doc(db!, "leave", leaveId);
                await setDoc(docRef, newRequest);
                return newRequest;
            } catch (error) {
                console.error("Firestore applyLeave failed:", error);
                throw error;
            }
        } else {
            if (typeof window !== "undefined") {
                localStorage.setItem(`hrms_leave_${leaveId}`, JSON.stringify(newRequest));
            }
            return newRequest;
        }
    }

    /**
     * Approves a pending leave request. Includes validation.
     */
    public async approveLeave(
        leaveId: string,
        approvedByUid: string,
        approvedByName: string,
        comments?: string
    ): Promise<void> {
        const leave = await this.getLeaveById(leaveId);
        if (!leave) throw new Error("Leave request not found.");

        // 1. Validation: Prevent double action
        if (leave.status === "approved") {
            throw new Error("This leave request is already approved.");
        }
        if (leave.status !== "pending") {
            throw new Error(`Cannot approve a leave request with status: ${leave.status}`);
        }

        // 2. Validation: Manager cannot approve their own leave
        if (leave.uid === approvedByUid) {
            throw new Error("Self-approval is not permitted. Managers cannot approve their own leaves.");
        }

        const updateData: Partial<LeaveRequest> = {
            status: "approved",
            approvedBy: approvedByUid,
            approvedByName: approvedByName,
            approvedAt: this.createTimestamp(new Date()),
            comments: comments || leave.comments,
            updatedAt: this.createTimestamp(new Date()),
        };

        if (this.isFirebaseEnabled()) {
            try {
                const docRef = doc(db!, "leave", leaveId);
                await updateDoc(docRef, updateData);
            } catch (error) {
                console.error("Firestore approveLeave failed:", error);
                throw error;
            }
        } else {
            if (typeof window !== "undefined") {
                const merged = { ...leave, ...updateData };
                localStorage.setItem(`hrms_leave_${leaveId}`, JSON.stringify(merged));
            }
        }
    }

    /**
     * Rejects a pending leave request. Requires a reason.
     */
    public async rejectLeave(
        leaveId: string,
        approvedByUid: string,
        approvedByName: string,
        rejectionReason: string,
        comments?: string
    ): Promise<void> {
        if (!rejectionReason || rejectionReason.trim() === "") {
            throw new Error("Rejection reason is mandatory.");
        }

        const leave = await this.getLeaveById(leaveId);
        if (!leave) throw new Error("Leave request not found.");

        // 1. Validation: Prevent double action
        if (leave.status === "rejected") {
            throw new Error("This leave request is already rejected.");
        }
        if (leave.status !== "pending") {
            throw new Error(`Cannot reject a leave request with status: ${leave.status}`);
        }

        // 2. Validation: Manager cannot reject their own leave
        if (leave.uid === approvedByUid) {
            throw new Error("Managers cannot reject their own leaves.");
        }

        const updateData: Partial<LeaveRequest> = {
            status: "rejected",
            approvedBy: approvedByUid,
            approvedByName: approvedByName,
            approvedAt: this.createTimestamp(new Date()),
            rejectionReason: rejectionReason,
            comments: comments || leave.comments,
            updatedAt: this.createTimestamp(new Date()),
        };

        if (this.isFirebaseEnabled()) {
            try {
                const docRef = doc(db!, "leave", leaveId);
                await updateDoc(docRef, updateData);
            } catch (error) {
                console.error("Firestore rejectLeave failed:", error);
                throw error;
            }
        } else {
            if (typeof window !== "undefined") {
                const merged = { ...leave, ...updateData };
                localStorage.setItem(`hrms_leave_${leaveId}`, JSON.stringify(merged));
            }
        }
    }

    /**
     * Cancels an employee's pending leave request.
     */
    public async cancelLeave(leaveId: string): Promise<void> {
        const leave = await this.getLeaveById(leaveId);
        if (!leave) throw new Error("Leave request not found.");

        // 1. Validation: Only pending leaves can be cancelled by employee
        if (leave.status !== "pending") {
            throw new Error("Only pending leave requests can be cancelled.");
        }

        const updateData: Partial<LeaveRequest> = {
            status: "cancelled",
            updatedAt: this.createTimestamp(new Date()),
        };

        if (this.isFirebaseEnabled()) {
            try {
                const docRef = doc(db!, "leave", leaveId);
                await updateDoc(docRef, updateData);
            } catch (error) {
                console.error("Firestore cancelLeave failed:", error);
                throw error;
            }
        } else {
            if (typeof window !== "undefined") {
                const merged = { ...leave, ...updateData };
                localStorage.setItem(`hrms_leave_${leaveId}`, JSON.stringify(merged));
            }
        }
    }

    /**
     * Get specific leave details by ID
     */
    public async getLeaveById(leaveId: string): Promise<LeaveRequest | null> {
        if (this.isFirebaseEnabled()) {
            try {
                const docRef = doc(db!, "leave", leaveId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    return { id: docSnap.id, ...docSnap.data() } as LeaveRequest;
                }
                return null;
            } catch (error) {
                console.error("Firestore getLeaveById failed:", error);
                throw error;
            }
        } else {
            if (typeof window === "undefined") return null;
            const stored = localStorage.getItem(`hrms_leave_${leaveId}`);
            if (stored) {
                return JSON.parse(stored) as LeaveRequest;
            }
            return null;
        }
    }

    /**
     * Returns leave requests filtered by multiple parameters.
     */
    public async getLeaveHistory(filters: LeaveFilters = {}): Promise<LeaveRequest[]> {
        let list: LeaveRequest[] = [];

        if (this.isFirebaseEnabled()) {
            try {
                const querySnapshot = await getDocs(collection(db!, "leave"));
                querySnapshot.forEach((d) => {
                    list.push({ ...d.data(), id: d.id } as LeaveRequest);
                });
            } catch (error) {
                console.error("Firestore getLeaveHistory failed:", error);
                throw error;
            }
        } else {
            if (typeof window === "undefined") return [];
            // this.ensureMockDataSeeded();

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith("hrms_leave_")) {
                    const stored = localStorage.getItem(key);
                    if (stored) {
                        try {
                            list.push(JSON.parse(stored) as LeaveRequest);
                        } catch (e) {
                            console.error("Failed to parse local leave request:", e);
                        }
                    }
                }
            }
        }

        // Apply filters in memory
        return list
            .filter((l) => {
                // Employee ID / User UID filter
                if (filters.employeeId && l.uid !== filters.employeeId) return false;

                // Leave Type filter
                if (filters.leaveType && l.leaveType !== filters.leaveType) return false;

                // Status filter
                if (filters.status && l.status !== filters.status) return false;

                // Department filter
                if (filters.department && l.department.toLowerCase() !== filters.department.toLowerCase()) return false;

                // Date range filters
                const start = this.toDate(l.startDate);
                const end = this.toDate(l.endDate);

                if (filters.startDate) {
                    const filterStart = new Date(filters.startDate);
                    if (end < filterStart) return false;
                }
                if (filters.endDate) {
                    const filterEnd = new Date(filters.endDate);
                    if (start > filterEnd) return false;
                }

                // Search text (search employeeName case-insensitive)
                if (filters.search) {
                    const query = filters.search.toLowerCase();
                    const empName = l.employeeName.toLowerCase();
                    if (!empName.includes(query)) return false;
                }

                return true;
            })
            .sort((a, b) => {
                // Sort by start date (descending)
                const dateA = this.toDate(a.startDate).getTime();
                const dateB = this.toDate(b.startDate).getTime();
                return dateB - dateA;
            });
    }

    /**
     * Retrieves pending approval leaves for a manager's team or all pending leaves.
     */
    public async getPendingLeaves(managerId?: string): Promise<LeaveRequest[]> {
        const allHistory = await this.getLeaveHistory({ status: "pending" });
        if (managerId) {
            return allHistory.filter((l) => l.managerId === managerId);
        }
        return allHistory;
    }

    /**
     * Get leave history specifically for a single employee
     */
    public async getLeavesByEmployee(uid: string): Promise<LeaveRequest[]> {
        return this.getLeaveHistory({ employeeId: uid });
    }

    /**
     * Get leave history specifically for a department
     */
    public async getLeavesByDepartment(department: string): Promise<LeaveRequest[]> {
        return this.getLeaveHistory({ department });
    }

    /**
     * Calculate leave balances for a specific user.
     */
    public async getLeaveBalances(uid: string): Promise<Record<LeaveType, LeaveBalance>> {
        const history = await this.getLeavesByEmployee(uid);
        const approvedLeaves = history.filter((l) => l.status === "approved");

        const defaultAllocations: Record<LeaveType, number> = {
            casual: 7,
            sick: 10,
            earned: 21,
            maternity: 30,
            paternity: 30,
            compOff: 5,
            lop: 0,
            wfh: 0,
        };

        const balances: Record<LeaveType, LeaveBalance> = {} as any;

        (Object.keys(defaultAllocations) as LeaveType[]).forEach((type) => {
            const allocated = defaultAllocations[type];
            const used = approvedLeaves
                .filter((l) => l.leaveType === type)
                .reduce((sum, l) => sum + l.totalDays, 0);

            balances[type] = {
                allocated,
                used,
                remaining: type === "lop" || type === "wfh" ? 0 : Math.max(0, allocated - used),
            };
        });

        return balances;
    }

    /**
     * Aggregates stats for the dashboard summary
     */
    public async getLeaveSummary(uid?: string, isManagerOrHR: boolean = false): Promise<LeaveSummary> {
        const filters: LeaveFilters = {};
        if (uid && !isManagerOrHR) {
            filters.employeeId = uid;
        }
        const leaves = await this.getLeaveHistory(filters);

        const approved = leaves.filter((l) => l.status === "approved").length;
        const pending = leaves.filter((l) => l.status === "pending").length;
        const rejected = leaves.filter((l) => l.status === "rejected").length;
        const totalLeaves = leaves.length;

        let remainingLeaves = 0;
        if (uid && !isManagerOrHR) {
            const balances = await this.getLeaveBalances(uid);
            remainingLeaves = Object.entries(balances)
                .filter(([type]) => type !== "lop" && type !== "wfh")
                .reduce((sum, [_, bal]) => sum + bal.remaining, 0);
        }

        return {
            totalLeaves,
            approved,
            pending,
            rejected,
            remainingLeaves,
        };
    }

    /**
     * Pre-seeds local storage mock database with realistic leave requests
     */
    // private ensureMockDataSeeded() {
    //     if (typeof window === "undefined") return;

    //     let hasLeaves = false;
    //     for (let i = 0; i < localStorage.length; i++) {
    //         const key = localStorage.key(i);
    //         if (key && key.startsWith("hrms_leave_")) {
    //             hasLeaves = true;
    //             break;
    //         }
    //     }

    //     if (!hasLeaves) {
    //         console.log("Seeding mock leaves into localStorage...");

    //         const createMockLeave = (
    //             id: string,
    //             uid: string,
    //             empId: string,
    //             name: string,
    //             email: string,
    //             dept: string,
    //             desig: string,
    //             leaveType: LeaveType,
    //             start: Date,
    //             end: Date,
    //             totalDays: number,
    //             halfDay: boolean,
    //             reason: string,
    //             status: LeaveStatus,
    //             managerId: string = "mock-uid-manager",
    //             managerName: string = "Project Manager",
    //             rejectReason?: string
    //         ): LeaveRequest => {
    //             const approvedBy = status === "approved" || status === "rejected" ? managerId : undefined;
    //             const approvedByName = status === "approved" || status === "rejected" ? managerName : undefined;
    //             const approvedAt = status === "approved" || status === "rejected"
    //                 ? this.createTimestamp(new Date(start.getTime() - 86400000))
    //                 : undefined;

    //             return {
    //                 id,
    //                 uid,
    //                 employeeId: empId,
    //                 employeeName: name,
    //                 employeeEmail: email,
    //                 department: dept,
    //                 designation: desig,
    //                 managerId,
    //                 managerName,
    //                 leaveType,
    //                 startDate: this.createTimestamp(start),
    //                 endDate: this.createTimestamp(end),
    //                 totalDays,
    //                 halfDay,
    //                 reason,
    //                 status,
    //                 approvedBy,
    //                 approvedByName,
    //                 approvedAt,
    //                 rejectionReason: rejectReason,
    //                 createdAt: this.createTimestamp(new Date(start.getTime() - 86400000 * 3)),
    //                 updatedAt: this.createTimestamp(new Date(start.getTime() - 86400000 * 2)),
    //             };
    //         };

    //         const mockLeaves = [
    //             createMockLeave(
    //                 "leave-1",
    //                 "mock-uid-emp1",
    //                 "EMP-EMPLOYEE-1004",
    //                 "Ananya Krishnan",
    //                 "ananya@company.com",
    //                 "Engineering",
    //                 "Software Engineer",
    //                 "sick",
    //                 new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    //                 new Date(new Date().getFullYear(), new Date().getMonth(), 2),
    //                 2,
    //                 false,
    //                 "Fever and severe cold",
    //                 "approved"
    //             ),
    //             createMockLeave(
    //                 "leave-2",
    //                 "mock-uid-emp1",
    //                 "EMP-EMPLOYEE-1004",
    //                 "Ananya Krishnan",
    //                 "ananya@company.com",
    //                 "Engineering",
    //                 "Software Engineer",
    //                 "earned",
    //                 new Date(new Date().getFullYear(), new Date().getMonth(), 15),
    //                 new Date(new Date().getFullYear(), new Date().getMonth(), 20),
    //                 4, // Exclude weekends if any
    //                 false,
    //                 "Family function in hometown",
    //                 "pending"
    //             ),
    //             createMockLeave(
    //                 "leave-3",
    //                 "mock-uid-emp1",
    //                 "EMP-EMPLOYEE-1004",
    //                 "Ananya Krishnan",
    //                 "ananya@company.com",
    //                 "Engineering",
    //                 "Software Engineer",
    //                 "casual",
    //                 new Date(new Date().getFullYear(), new Date().getMonth() - 1, 12),
    //                 new Date(new Date().getFullYear(), new Date().getMonth() - 1, 12),
    //                 0.5,
    //                 true,
    //                 "Personal dental appointment",
    //                 "approved"
    //             ),
    //             createMockLeave(
    //                 "leave-4",
    //                 "mock-uid-emp2",
    //                 "EMP-EMPLOYEE-1005",
    //                 "Rahul Sharma",
    //                 "rahul@company.com",
    //                 "Product",
    //                 "Product Designer",
    //                 "earned",
    //                 new Date(new Date().getFullYear(), new Date().getMonth(), 10),
    //                 new Date(new Date().getFullYear(), new Date().getMonth(), 12),
    //                 3,
    //                 false,
    //                 "Visiting parents for anniversary",
    //                 "approved"
    //             ),
    //             createMockLeave(
    //                 "leave-5",
    //                 "mock-uid-emp2",
    //                 "EMP-EMPLOYEE-1005",
    //                 "Rahul Sharma",
    //                 "rahul@company.com",
    //                 "Product",
    //                 "Product Designer",
    //                 "casual",
    //                 new Date(new Date().getFullYear(), new Date().getMonth() + 1, 5),
    //                 new Date(new Date().getFullYear(), new Date().getMonth() + 1, 6),
    //                 2,
    //                 false,
    //                 "Attending close friend's wedding",
    //                 "pending"
    //             ),
    //             createMockLeave(
    //                 "leave-6",
    //                 "mock-uid-emp2",
    //                 "EMP-EMPLOYEE-1005",
    //                 "Rahul Sharma",
    //                 "rahul@company.com",
    //                 "Product",
    //                 "Product Designer",
    //                 "sick",
    //                 new Date(new Date().getFullYear(), new Date().getMonth() - 1, 20),
    //                 new Date(new Date().getFullYear(), new Date().getMonth() - 1, 22),
    //                 3,
    //                 false,
    //                 "Viral infection recovery",
    //                 "rejected",
    //                 "mock-uid-manager",
    //                 "Project Manager",
    //                 "Applied after dates without notice. Please submit medical documentation to HR."
    //             ),
    //         ];

    //         mockLeaves.forEach((leave) => {
    //             localStorage.setItem(`hrms_leave_${leave.id}`, JSON.stringify(leave));
    //         });
        // }
    }


export const leaveService = new LeaveService();
export default leaveService;
