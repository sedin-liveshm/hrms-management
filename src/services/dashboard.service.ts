import { db } from "@/firebase/firestore";
import { isFirebaseConfigured } from "@/firebase/config";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import type { Employee } from "@/types/employee";
import { AttendanceStatus, type AttendanceRecord } from "@/types/attendance";
import type { LeaveRequest } from "@/types/leave";
import type { Announcement } from "@/types/announcement";

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  employeesOnLeave: number;
  presentToday: number;
  lateToday: number;
  absentToday: number;
  pendingLeaves: number;
}

export interface DashboardData {
  stats: DashboardStats;
  announcements: Announcement[];
  recentEmployees: Employee[];
  leaveRequests: LeaveRequest[];
}

class DashboardService {
  private isFirebaseEnabled(): boolean {
    return isFirebaseConfigured && db !== null;
  }

  private getLocalDateString(date: Date = new Date()): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  private toDate(
    ts: Timestamp | { seconds: number; nanoseconds: number } | string | Date | null | undefined
  ): Date {
    if (!ts) return new Date();
    if (ts instanceof Date) return ts;
    if (typeof ts === "string") return new Date(ts);
    
    const obj = ts as Record<string, unknown>;
    if (typeof obj.toDate === "function") {
      return (obj.toDate as () => Date)();
    }
    if (typeof obj.seconds === "number") {
      return new Date(obj.seconds * 1000);
    }
    return new Date(ts as unknown as string);
  }

  /**
   * Retrieves data and statistics tailored to the current user's role and identity.
   */
  public async getDashboardData(role: string, uid: string): Promise<DashboardData> {
    const todayStr = this.getLocalDateString();

    if (this.isFirebaseEnabled()) {
      try {
        // 1. Fetch Users
        const usersSnap = await getDocs(collection(db!, "users"));
        const allUsers: Employee[] = [];
        usersSnap.forEach((doc) => {
          const data = doc.data();
          if (data.employeeId || data.role) {
            allUsers.push({ uid: data.uid || doc.id, ...data } as Employee);
          }
        });

        // Filter active/inactive
        const activeUsers = allUsers.filter((u) => u.status === "active");
        const onLeaveUsers = allUsers.filter((u) => u.status === "on-leave");

        // 2. Fetch Today's Attendance
        const attendanceQuery = query(
          collection(db!, "attendance"),
          where("date", "==", todayStr)
        );
        const attendanceSnap = await getDocs(attendanceQuery);
        const todayAttendance: AttendanceRecord[] = [];
        attendanceSnap.forEach((doc) => {
          todayAttendance.push({ id: doc.id, ...doc.data() } as AttendanceRecord);
        });

        // Filter users by role scope
        let displayUsers = allUsers;
        let displayActiveUsers = activeUsers;
        let displayOnLeaveUsers = onLeaveUsers;
        let displayAttendance = todayAttendance;

        if (role === "manager") {
          const currentMgr = allUsers.find((u) => u.uid === uid);
          const mgrId = currentMgr?.employeeId || uid;
          displayUsers = allUsers.filter((u) => u.managerId === mgrId || u.managerId === uid);
          displayActiveUsers = displayUsers.filter((u) => u.status === "active");
          displayOnLeaveUsers = displayUsers.filter((u) => u.status === "on-leave");
          displayAttendance = todayAttendance.filter((a) =>
            displayUsers.some((t) => t.uid === a.uid || t.employeeId === a.uid)
          );
        }

        const presentToday = displayAttendance.length;
        const lateToday = displayAttendance.filter((a) => a.status === AttendanceStatus.LATE).length;
        const absentToday = Math.max(0, displayActiveUsers.length - presentToday);

        // 3. Fetch Leaves
        const leavesSnap = await getDocs(collection(db!, "leave"));
        const allLeaves: LeaveRequest[] = [];
        leavesSnap.forEach((doc) => {
          allLeaves.push({ id: doc.id, ...doc.data() } as LeaveRequest);
        });

        // Filter leaves by role scope
        let relevantLeaves = allLeaves;
        if (role === "employee") {
          relevantLeaves = allLeaves.filter((l) => l.uid === uid);
        } else if (role === "manager") {
          // Find manager's name/ID to filter team requests
          const currentUserProfile = allUsers.find((u) => u.uid === uid);
          const mgrId = currentUserProfile?.employeeId || uid;
          const mgrName = currentUserProfile?.name || "";
          relevantLeaves = allLeaves.filter(
            (l) => l.managerId === uid || l.managerId === mgrId || l.managerName === mgrName || l.uid === uid
          );
        }

        const pendingLeaves = relevantLeaves.filter((l) => l.status === "pending").length;

        // 4. Fetch Announcements (latest 5)
        const announcementsQuery = query(
          collection(db!, "announcements"),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const announcementsSnap = await getDocs(announcementsQuery);
        const announcements: Announcement[] = [];
        announcementsSnap.forEach((doc) => {
          announcements.push({ id: doc.id, ...doc.data() } as Announcement);
        });

        // 5. Recent Employees (latest 5 joined)
        const recentEmployees = [...displayActiveUsers]
          .sort((a, b) => {
            const dateA = a.joiningDate ? new Date(a.joiningDate).getTime() : 0;
            const dateB = b.joiningDate ? new Date(b.joiningDate).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 5);

        return {
          stats: {
            totalEmployees: displayUsers.length,
            activeEmployees: displayActiveUsers.length,
            employeesOnLeave: displayOnLeaveUsers.length || allLeaves.filter(
              (l) => {
                if (role === "manager") {
                  const currentMgr = allUsers.find((u) => u.uid === uid);
                  const mgrId = currentMgr?.employeeId || uid;
                  if (l.managerId !== mgrId && l.managerId !== uid) return false;
                }
                const start = this.getLocalDateString(this.toDate(l.startDate));
                const end = this.getLocalDateString(this.toDate(l.endDate));
                return l.status === "approved" && todayStr >= start && todayStr <= end;
              }
            ).length,
            presentToday,
            lateToday,
            absentToday,
            pendingLeaves,
          },
          announcements,
          recentEmployees,
          leaveRequests: relevantLeaves.filter((l) => l.status === "pending").slice(0, 5),
        };
      } catch (error) {
        console.error("Firestore getDashboardData failed, falling back to mock:", error);
        return this.getMockDashboardData(role, uid, todayStr);
      }
    } else {
      return this.getMockDashboardData(role, uid, todayStr);
    }
  }

  /**
   * Mock fallback generator pulling from LocalStorage values
   */
  private getMockDashboardData(role: string, uid: string, todayStr: string): DashboardData {
    if (typeof window === "undefined") {
      return {
        stats: {
          totalEmployees: 0,
          activeEmployees: 0,
          employeesOnLeave: 0,
          presentToday: 0,
          lateToday: 0,
          absentToday: 0,
          pendingLeaves: 0,
        },
        announcements: [],
        recentEmployees: [],
        leaveRequests: [],
      };
    }

    // 1. Load users
    const allUsers: Employee[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("hrms_profile_")) {
        try {
          const profile = JSON.parse(localStorage.getItem(key) || "");
          if (profile && (profile.employeeId || profile.role)) {
            allUsers.push({
              ...profile,
              uid: profile.uid || profile.employeeId,
            } as Employee);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    const activeUsers = allUsers.filter((u) => u.status === "active");
    const onLeaveUsers = allUsers.filter((u) => u.status === "on-leave");

    // Filter users by role scope
    let displayUsers = allUsers;
    let displayActiveUsers = activeUsers;
    let displayOnLeaveUsers = onLeaveUsers;

    if (role === "manager") {
      const currentMgr = allUsers.find((u) => u.uid === uid);
      const mgrId = currentMgr?.employeeId || uid;
      displayUsers = allUsers.filter((u) => u.managerId === mgrId || u.managerId === uid);
      displayActiveUsers = displayUsers.filter((u) => u.status === "active");
      displayOnLeaveUsers = displayUsers.filter((u) => u.status === "on-leave");
    }

    // 2. Load attendance
    const todayAttendance: AttendanceRecord[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("hrms_attendance_")) {
        try {
          const record = JSON.parse(localStorage.getItem(key) || "");
          if (record && record.date === todayStr) {
            todayAttendance.push(record as AttendanceRecord);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    let displayAttendance = todayAttendance;
    if (role === "manager") {
      displayAttendance = todayAttendance.filter((a) =>
        displayUsers.some((t) => t.uid === a.uid || t.employeeId === a.uid)
      );
    }

    const presentToday = displayAttendance.length;
    const lateToday = displayAttendance.filter((a) => a.status === AttendanceStatus.LATE).length;
    const absentToday = Math.max(0, displayActiveUsers.length - presentToday);

    // 3. Load leaves
    const allLeaves: LeaveRequest[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("hrms_leave_")) {
        try {
          const leave = JSON.parse(localStorage.getItem(key) || "");
          if (leave) {
            allLeaves.push(leave as LeaveRequest);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Filter leaves
    let relevantLeaves = allLeaves;
    if (role === "employee") {
      relevantLeaves = allLeaves.filter((l) => l.uid === uid);
    } else if (role === "manager") {
      const currentUser = allUsers.find((u) => u.uid === uid);
      const mgrId = currentUser?.employeeId || uid;
      const name = currentUser?.name || "";
      relevantLeaves = allLeaves.filter(
        (l) => l.managerId === uid || l.managerId === mgrId || l.managerName === name || l.uid === uid
      );
    }

    const pendingLeaves = relevantLeaves.filter((l) => l.status === "pending").length;

    // 4. Load announcements
    const announcements: Announcement[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("hrms_announcement_")) {
        try {
          const ann = JSON.parse(localStorage.getItem(key) || "");
          if (ann) {
            announcements.push(ann as Announcement);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    // Sort descending
    announcements.sort((a, b) => {
      const dateA = a.createdAt ? this.toDate(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? this.toDate(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    const recentEmployees = [...displayActiveUsers]
      .sort((a, b) => {
        const dateA = a.joiningDate ? new Date(a.joiningDate).getTime() : 0;
        const dateB = b.joiningDate ? new Date(b.joiningDate).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);

    return {
      stats: {
        totalEmployees: displayUsers.length,
        activeEmployees: displayActiveUsers.length,
        employeesOnLeave: displayOnLeaveUsers.length || allLeaves.filter(
          (l) => {
            if (role === "manager") {
              const currentMgr = allUsers.find((u) => u.uid === uid);
              const mgrId = currentMgr?.employeeId || uid;
              if (l.managerId !== mgrId && l.managerId !== uid) return false;
            }
            const start = this.getLocalDateString(this.toDate(l.startDate));
            const end = this.getLocalDateString(this.toDate(l.endDate));
            return l.status === "approved" && todayStr >= start && todayStr <= end;
          }
        ).length,
        presentToday,
        lateToday,
        absentToday,
        pendingLeaves,
      },
      announcements: announcements.slice(0, 5),
      recentEmployees,
      leaveRequests: relevantLeaves.filter((l) => l.status === "pending").slice(0, 5),
    };
  }
}

export const dashboardService = new DashboardService();
