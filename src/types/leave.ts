import { Timestamp } from "firebase/firestore";

export type LeaveType =
  | "casual"
  | "sick"
  | "earned"
  | "maternity"
  | "paternity"
  | "compOff"
  | "lop"
  | "wfh";

/**
 * Human-readable mapping of leave types
 */
export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  casual: "Casual Leave",
  sick: "Sick Leave",
  earned: "Earned Leave",
  maternity: "Maternity Leave",
  paternity: "Paternity Leave",
  compOff: "Compensatory Off",
  lop: "Loss of Pay",
  wfh: "Work from Home",
};

/**
 * Valid Leave Status values
 */
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

/**
 * Single Leave Request Document structure in Firestore
 */
export interface LeaveRequest {
  id: string;
  uid: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  designation: string;
  managerId: string;
  managerName: string;
  leaveType: LeaveType;
  startDate: Timestamp;
  endDate: Timestamp;
  totalDays: number;
  halfDay: boolean;
  reason: string;
  emergencyContact?: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: Timestamp;
  rejectionReason?: string;
  comments?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Leave Balance schema for calculation
 */
export interface LeaveBalance {
  allocated: number;
  used: number;
  remaining: number;
}

/**
 * Aggregate summary of leave counts
 */
export interface LeaveSummary {
  totalLeaves: number; // Applied count
  approved: number;
  pending: number;
  rejected: number;
  remainingLeaves: number; // Sum of paid remaining leaves
}

/**
 * Combined filter interface for queries
 */
export interface LeaveFilters {
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  leaveType?: LeaveType | "";
  department?: string;
  employeeId?: string;
  status?: LeaveStatus | "";
  search?: string; // Search by employee name
}
