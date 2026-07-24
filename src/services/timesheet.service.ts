import { db } from "@/firebase/firestore";
import { isFirebaseConfigured } from "@/firebase/config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import type { TimesheetLog, TimesheetStatus, TimesheetSummary, TimesheetSubmission } from "@/types/timesheet";
import { startOfWeek, endOfWeek, parseISO, format } from "date-fns";

class TimesheetService {
  private isFirebaseEnabled(): boolean {
    return isFirebaseConfigured && db !== null;
  }

  // -----------------------------------------
  // DAILY LOGS
  // -----------------------------------------

  public async logTime(
    data: Omit<TimesheetLog, "id" | "status" | "createdAt" | "updatedAt">
  ): Promise<TimesheetLog> {
    if (data.hours > 24) throw new Error("Cannot log more than 24 hours in a single day.");
    
    // Prevent future dates
    const logDate = new Date(data.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (logDate > today) throw new Error("Cannot log time for future dates.");

    const entryId = `tslog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const nowISO = new Date().toISOString();

    const newLog: TimesheetLog = {
      ...data,
      id: entryId,
      status: "Draft",
      createdAt: nowISO,
      updatedAt: nowISO,
    };

    if (this.isFirebaseEnabled()) {
      try {
        const docRef = doc(db!, "timesheet_logs", entryId);
        await setDoc(docRef, newLog);
        return newLog;
      } catch (error) {
        console.error("Firestore logTime failed:", error);
        throw error;
      }
    } else {
      if (typeof window !== "undefined") {
        localStorage.setItem(`hrms_tslog_${entryId}`, JSON.stringify(newLog));
      }
      return newLog;
    }
  }

  public async updateDailyTime(
    id: string, 
    updates: Partial<Omit<TimesheetLog, "id" | "uid" | "createdAt" | "status">>
  ): Promise<void> {
    const log = await this.getLogById(id);
    if (!log) throw new Error("Timesheet log not found.");
    if (log.status === "Approved" || log.status === "Pending Manager" || log.status === "Pending HR") {
      throw new Error(`Cannot edit a log in ${log.status} state.`);
    }

    const merged: TimesheetLog = { ...log, ...updates, updatedAt: new Date().toISOString() };

    if (this.isFirebaseEnabled()) {
      await updateDoc(doc(db!, "timesheet_logs", id), merged as any);
    } else {
      localStorage.setItem(`hrms_tslog_${id}`, JSON.stringify(merged));
    }
  }

  public async getLogById(id: string): Promise<TimesheetLog | null> {
    if (this.isFirebaseEnabled()) {
      const docSnap = await getDoc(doc(db!, "timesheet_logs", id));
      return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as TimesheetLog) : null;
    } else {
      if (typeof window === "undefined") return null;
      const stored = localStorage.getItem(`hrms_tslog_${id}`);
      return stored ? JSON.parse(stored) : null;
    }
  }

  public async deleteProjectRow(uid: string, project: string, task: string, weekStart: Date): Promise<void> {
    const startStr = format(startOfWeek(weekStart, { weekStartsOn: 1 }), "yyyy-MM-dd");
    const endStr = format(endOfWeek(weekStart, { weekStartsOn: 1 }), "yyyy-MM-dd");

    const allLogs = await this.getEmployeeTimesheets(uid);
    const logsToDelete = allLogs.filter((log) => {
      return log.project === project && log.task === task && log.date >= startStr && log.date <= endStr;
    });

    if (this.isFirebaseEnabled()) {
      for (const log of logsToDelete) {
        if (log.status === "Approved" || log.status === "Pending Manager" || log.status === "Pending HR") {
            throw new Error(`Cannot delete log in ${log.status} state.`);
        }
        await deleteDoc(doc(db!, "timesheet_logs", log.id));
      }
    } else {
      if (typeof window === "undefined") return;
      for (const log of logsToDelete) {
        if (log.status === "Approved" || log.status === "Pending Manager" || log.status === "Pending HR") {
            throw new Error(`Cannot delete log in ${log.status} state.`);
        }
        localStorage.removeItem(`hrms_tslog_${log.id}`);
      }
    }
  }

  public async getEmployeeTimesheets(uid: string): Promise<TimesheetLog[]> {
    let list: TimesheetLog[] = [];
    if (this.isFirebaseEnabled()) {
      const q = query(collection(db!, "timesheet_logs"), where("uid", "==", uid));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((d) => list.push({ ...d.data(), id: d.id } as TimesheetLog));
    } else {
      if (typeof window === "undefined") return [];
      this.ensureMockDataSeeded(uid);
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("hrms_tslog_")) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const parsed = JSON.parse(stored) as TimesheetLog;
            if (parsed.uid === uid) list.push(parsed);
          }
        }
      }
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // -----------------------------------------
  // WEEKLY SUBMISSIONS
  // -----------------------------------------

  public async submitWeeklyTimesheet(uid: string, employeeName: string, dateInWeek: Date): Promise<void> {
    const start = startOfWeek(dateInWeek, { weekStartsOn: 1 });
    const end = endOfWeek(dateInWeek, { weekStartsOn: 1 });
    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];

    const allLogs = await this.getEmployeeTimesheets(uid);
    const weekLogs = allLogs.filter((log) => {
      const logDate = parseISO(log.date);
      return logDate >= start && logDate <= end && (log.status === "Draft" || log.status === "Returned" || log.status === "Rejected");
    });

    if (weekLogs.length === 0) {
      throw new Error("No draft or returned entries found for this week to submit.");
    }

    const totalHours = weekLogs.reduce((sum, log) => sum + log.hours, 0);
    const subId = `tssub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const nowISO = new Date().toISOString();

    const submission: TimesheetSubmission = {
      id: subId,
      uid,
      employeeId: `EMP-${uid.substring(0,4).toUpperCase()}`,
      employeeName,
      weekStartDate: startStr,
      weekEndDate: endStr,
      totalHours,
      status: "Pending Manager",
      submittedAt: nowISO,
    };

    if (this.isFirebaseEnabled()) {
      await setDoc(doc(db!, "timesheet_submissions", subId), submission);
      // Batch update logs would be better, but doing sequentially for now
      for (const log of weekLogs) {
        await updateDoc(doc(db!, "timesheet_logs", log.id), { status: "Pending Manager", submissionId: subId });
      }
    } else {
      localStorage.setItem(`hrms_tssub_${subId}`, JSON.stringify(submission));
      for (const log of weekLogs) {
        const updated = { ...log, status: "Pending Manager", submissionId: subId } as TimesheetLog;
        localStorage.setItem(`hrms_tslog_${log.id}`, JSON.stringify(updated));
      }
    }
  }

  public async getEmployeeSubmissions(uid: string): Promise<TimesheetSubmission[]> {
    let list: TimesheetSubmission[] = [];
    if (this.isFirebaseEnabled()) {
      const q = query(collection(db!, "timesheet_submissions"), where("uid", "==", uid));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((d) => list.push({ ...d.data(), id: d.id } as TimesheetSubmission));
    } else {
      if (typeof window === "undefined") return [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("hrms_tssub_")) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const parsed = JSON.parse(stored) as TimesheetSubmission;
            if (parsed.uid === uid) list.push(parsed);
          }
        }
      }
    }
    return list.sort((a, b) => new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime());
  }

  public async getAllPendingSubmissions(): Promise<TimesheetSubmission[]> {
    let list: TimesheetSubmission[] = [];
    if (this.isFirebaseEnabled()) {
      const q = query(collection(db!, "timesheet_submissions"), where("status", "==", "Pending Manager"));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((d) => list.push({ ...d.data(), id: d.id } as TimesheetSubmission));
    } else {
      if (typeof window === "undefined") return [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("hrms_tssub_")) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const parsed = JSON.parse(stored) as TimesheetSubmission;
            if (parsed.status === "Pending Manager") list.push(parsed);
          }
        }
      }
    }
    return list;
  }

  // -----------------------------------------
  // APPROVALS
  // -----------------------------------------

  public async updateSubmissionStatus(subId: string, status: TimesheetStatus, reason?: string): Promise<void> {
    let submission: TimesheetSubmission | null = null;
    
    if (this.isFirebaseEnabled()) {
      const docSnap = await getDoc(doc(db!, "timesheet_submissions", subId));
      if (docSnap.exists()) submission = docSnap.data() as TimesheetSubmission;
    } else {
      const stored = localStorage.getItem(`hrms_tssub_${subId}`);
      if (stored) submission = JSON.parse(stored);
    }

    if (!submission) throw new Error("Submission not found.");

    submission.status = status;
    if (status === "Approved") submission.approvedAt = new Date().toISOString();
    if (reason) submission.rejectionReason = reason;

    if (this.isFirebaseEnabled()) {
      await updateDoc(doc(db!, "timesheet_submissions", subId), submission as any);
      // Update all associated logs
      const q = query(collection(db!, "timesheet_logs"), where("submissionId", "==", subId));
      const snaps = await getDocs(q);
      snaps.forEach(async (d) => {
        await updateDoc(doc(db!, "timesheet_logs", d.id), { status });
      });
    } else {
      localStorage.setItem(`hrms_tssub_${subId}`, JSON.stringify(submission));
      // Update local logs
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("hrms_tslog_")) {
          const log = JSON.parse(localStorage.getItem(key)!) as TimesheetLog;
          if (log.submissionId === subId) {
            log.status = status;
            localStorage.setItem(key, JSON.stringify(log));
          }
        }
      }
    }
  }

  // -----------------------------------------
  // DASHBOARD SUMMARY
  // -----------------------------------------

  public async getTimesheetSummary(uid: string, dateInWeek: Date = new Date()): Promise<TimesheetSummary> {
    const logs = await this.getEmployeeTimesheets(uid);
    const start = startOfWeek(dateInWeek, { weekStartsOn: 1 });
    const end = endOfWeek(dateInWeek, { weekStartsOn: 1 });

    const weekLogs = logs.filter((log) => {
      const logDate = parseISO(log.date);
      return logDate >= start && logDate <= end;
    });

    const totalHours = weekLogs.reduce((sum, log) => sum + log.hours, 0);
    const billableHours = weekLogs
      .filter((log) => !log.project.toLowerCase().includes("internal"))
      .reduce((sum, log) => sum + log.hours, 0);
      
    const pendingHours = logs
      .filter((log) => log.status === "Pending Manager")
      .reduce((sum, log) => sum + log.hours, 0);

    const uniqueProjects = Array.from(new Set(weekLogs.map((log) => log.project))).length;

    return {
      totalHours,
      billableHours,
      pendingHours,
      uniqueProjects,
    };
  }

  // -----------------------------------------
  // MOCK SEEDING
  // -----------------------------------------
  private ensureMockDataSeeded(uid: string) {
    if (typeof window === "undefined") return;
    let hasLogs = false;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("hrms_tslog_")) {
        hasLogs = true; break;
      }
    }
    if (!hasLogs) {
      const createMockLog = (id: string, p: string, t: string, c: string, offset: number, h: number, s: TimesheetStatus): TimesheetLog => {
        const d = new Date(); d.setDate(d.getDate() - offset);
        const iso = d.toISOString();
        return {
          id, uid, employeeId: "EMP-MOCK", employeeName: "Mock User",
          project: p, task: t, comments: c, date: iso.split('T')[0],
          hours: h, status: s, createdAt: iso, updatedAt: iso,
        };
      };
      const mockLogs = [
        createMockLog("tslog-1", "Internal CRM", "Frontend Setup", "Configured React.", 0, 8, "Draft"),
        createMockLog("tslog-2", "Internal CRM", "API Integration", "Connected endpoints.", 1, 8, "Draft"),
        createMockLog("tslog-3", "Client Portal", "Review", "Sprint review.", 7, 8, "Approved"),
      ];
      mockLogs.forEach((log) => localStorage.setItem(`hrms_tslog_${log.id}`, JSON.stringify(log)));
    }
  }
}

export const timesheetService = new TimesheetService();
export default timesheetService;
