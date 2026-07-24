import { Timestamp } from "firebase/firestore";

export type TimesheetStatus = 
  | "Draft" 
  | "Pending Manager" 
  | "Pending HR" 
  | "Approved" 
  | "Rejected" 
  | "Returned";

export interface TimesheetLog {
  id: string;
  uid: string;
  employeeId: string;
  employeeName: string;
  project: string;
  task: string;
  comments: string;
  date: string; 
  hours: number;
  status: TimesheetStatus;
  submissionId?: string; // Links to the weekly submission
  createdAt: string; 
  updatedAt: string; 
}

export interface TimesheetSubmission {
  id: string;
  uid: string;
  employeeId: string;
  employeeName: string;
  weekStartDate: string;
  weekEndDate: string;
  totalHours: number;
  status: TimesheetStatus;
  managerId?: string;
  submittedAt: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface TimesheetSummary {
  totalHours: number;
  billableHours: number;
  pendingHours: number;
  uniqueProjects: number;
}
