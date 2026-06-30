export enum AttendanceStatus {
  PRESENT = "Present",
  ABSENT = "Absent",
  LATE = "Late",
  HALF_DAY = "Half Day",
  WORK_FROM_HOME = "Work From Home",
  LEAVE = "Leave",
}


export interface AttendanceRecord {
  /** Composite key: YYYY-MM-DD_uid */
  id: string;
  /** User UID of the employee */
  uid: string;
  /** Custom organization employee ID (e.g. EMP-ENG-1024) */
  employeeId: string;
  /** Full name of the employee (cached/joined) */
  employeeName: string;
  /** Department name (cached/joined) */
  department?: string;
  /** Date in YYYY-MM-DD format */
  date: string;
  /** Check-in ISO timestamp string, null if absent/leave */
  checkIn: string | null;
  /** Check-out ISO timestamp string, null if not checked out yet */
  checkOut: string | null;
  /** Computed total hours worked in decimal form */
  totalHours: number | null;
  /** Attendance classification status */
  status: AttendanceStatus;
  /** Record creation timestamp */
  createdAt: string;
  /** Record last update timestamp */
  updatedAt: string;
}

export interface AttendanceSummary {
  presentCount: number;
  absentCount: number;
  lateCount: number;
  wfhCount: number;
  leaveCount: number;
  halfDayCount: number;
  attendancePercentage: number;
}

export interface AttendanceFilters {
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  employeeId?: string; // Search/filter by employee uid or id
  status?: AttendanceStatus | "";
  department?: string;
  search?: string; // Free text search for employee name
}
