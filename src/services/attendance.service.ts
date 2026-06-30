import { db } from "@/firebase/firestore";
import { isFirebaseConfigured } from "@/firebase/config";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import { AttendanceStatus, type AttendanceRecord, type AttendanceSummary, type AttendanceFilters } from "@/types/attendance";

class AttendanceService {
    /**
     * Checks if Firestore is active and initialized.
     */
    private isFirebaseEnabled(): boolean {
        return isFirebaseConfigured && db !== null;
    }

    /**
     * Helper to format Date object into local YYYY-MM-DD string.
     */
    public getLocalDateString(date: Date = new Date()): string {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }

    /**
     * Perform employee check-in for the current day.
     */
    public async checkIn(
        uid: string,
        employeeId: string,
        employeeName: string,
        department?: string
    ): Promise<AttendanceRecord> {
        const now = new Date();
        const dateStr = this.getLocalDateString(now);
        const id = `${dateStr}_${uid}`;
        const isoNow = now.toISOString();

        // Determine status (Late after 09:15 AM local time)
        const lateThreshold = new Date(now);
        lateThreshold.setHours(9, 15, 0, 0);
        const status = now > lateThreshold ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;

        const newRecord: AttendanceRecord = {
            id,
            uid,
            employeeId,
            employeeName,
            department: department || "General",
            date: dateStr,
            checkIn: isoNow,
            checkOut: null,
            totalHours: null,
            status,
            createdAt: isoNow,
            updatedAt: isoNow,
        };

        if (this.isFirebaseEnabled()) {
            try {
                const docRef = doc(db!, "attendance", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    throw new Error("Already checked in for today.");
                }
                await setDoc(docRef, newRecord);
                return newRecord;
            } catch (error) {
                console.error("Firestore checkIn failed:", error);
                throw error;
            }
        } else {
            // LocalStorage mock implementation
            if (typeof window === "undefined") {
                throw new Error("Window is undefined.");
            }
            this.ensureMockDataSeeded();
            const existing = localStorage.getItem(`hrms_attendance_${id}`);
            if (existing) {
                throw new Error("Already checked in for today.");
            }
            localStorage.setItem(`hrms_attendance_${id}`, JSON.stringify(newRecord));
            return newRecord;
        }
    }

    /**
     * Perform employee check-out for the current day.
     */
    public async checkOut(uid: string): Promise<AttendanceRecord> {
        const now = new Date();
        const dateStr = this.getLocalDateString(now);
        const id = `${dateStr}_${uid}`;
        const isoNow = now.toISOString();

        if (this.isFirebaseEnabled()) {
            try {
                const docRef = doc(db!, "attendance", id);
                const docSnap = await getDoc(docRef);
                if (!docSnap.exists()) {
                    throw new Error("No check-in record found for today.");
                }
                const record = docSnap.data() as AttendanceRecord;
                if (record.checkOut) {
                    throw new Error("Already checked out for today.");
                }

                const checkInTime = new Date(record.checkIn!).getTime();
                const checkOutTime = now.getTime();
                const diffMs = checkOutTime - checkInTime;
                const totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

                const updatedRecord: Partial<AttendanceRecord> = {
                    checkOut: isoNow,
                    totalHours,
                    updatedAt: isoNow,
                };

                // Determine if total hours is less than 4 (Half Day classification)
                if (totalHours < 4 && record.status !== AttendanceStatus.LATE) {
                    updatedRecord.status = AttendanceStatus.HALF_DAY;
                }

                await updateDoc(docRef, updatedRecord);
                return { ...record, ...updatedRecord };
            } catch (error) {
                console.error("Firestore checkOut failed:", error);
                throw error;
            }
        } else {
            // LocalStorage mock implementation
            if (typeof window === "undefined") {
                throw new Error("Window is undefined.");
            }
            const storedStr = localStorage.getItem(`hrms_attendance_${id}`);
            if (!storedStr) {
                throw new Error("No check-in record found for today.");
            }
            const record = JSON.parse(storedStr) as AttendanceRecord;
            if (record.checkOut) {
                throw new Error("Already checked out for today.");
            }

            const checkInTime = new Date(record.checkIn!).getTime();
            const checkOutTime = now.getTime();
            const diffMs = checkOutTime - checkInTime;
            const totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

            const updatedRecord: AttendanceRecord = {
                ...record,
                checkOut: isoNow,
                totalHours,
                updatedAt: isoNow,
            };

            if (totalHours < 4 && record.status !== AttendanceStatus.LATE) {
                updatedRecord.status = AttendanceStatus.HALF_DAY;
            }

            localStorage.setItem(`hrms_attendance_${id}`, JSON.stringify(updatedRecord));
            return updatedRecord;
        }
    }

    /**
     * Updates an existing attendance record (For Admin management).
     */
    public async updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>): Promise<void> {
        const isoNow = new Date().toISOString();
        const data = {
            ...updates,
            updatedAt: isoNow,
        };

        if (this.isFirebaseEnabled()) {
            try {
                const docRef = doc(db!, "attendance", id);
                await updateDoc(docRef, data);
            } catch (error) {
                console.error("Firestore updateAttendanceRecord failed:", error);
                throw error;
            }
        } else {
            if (typeof window === "undefined") return;
            const stored = localStorage.getItem(`hrms_attendance_${id}`);
            if (stored) {
                const record = JSON.parse(stored) as AttendanceRecord;
                const merged = { ...record, ...data };
                localStorage.setItem(`hrms_attendance_${id}`, JSON.stringify(merged));
            } else {
                throw new Error("Attendance record not found");
            }
        }
    }

    /**
     * Fetches attendance records for all employees or filtered.
     */
    public async getAttendance(filters?: AttendanceFilters): Promise<AttendanceRecord[]> {
        let records: AttendanceRecord[] = [];

        if (this.isFirebaseEnabled()) {
            try {
                const querySnapshot = await getDocs(collection(db!, "attendance"));
                querySnapshot.forEach((d) => {
                    records.push({ ...d.data(), id: d.id } as AttendanceRecord);
                });
            } catch (error) {
                console.error("Firestore getAttendance failed:", error);
                throw error;
            }
        } else {
            // LocalStorage mock implementation
            if (typeof window === "undefined") return [];
            this.ensureMockDataSeeded();

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith("hrms_attendance_")) {
                    const recordStr = localStorage.getItem(key);
                    if (recordStr) {
                        try {
                            records.push(JSON.parse(recordStr) as AttendanceRecord);
                        } catch (e) {
                            console.error("Failed to parse attendance log:", e);
                        }
                    }
                }
            }
        }

        // Filter in-memory for robust unified execution
        if (filters) {
            records = records.filter((rec) => {
                // Date range filter
                if (filters.startDate && rec.date < filters.startDate) return false;
                if (filters.endDate && rec.date > filters.endDate) return false;

                // Employee ID / User UID filter
                if (filters.employeeId && rec.uid !== filters.employeeId) return false;

                // Status filter
                if (filters.status && rec.status !== filters.status) return false;

                // Department filter (Case insensitive)
                if (filters.department) {
                    if (!rec.department || rec.department.toLowerCase() !== filters.department.toLowerCase()) {
                        return false;
                    }
                }

                // Search text (Search in employee name or employee id)
                if (filters.search) {
                    const searchLower = filters.search.toLowerCase();
                    const nameMatch = rec.employeeName.toLowerCase().includes(searchLower);
                    const idMatch = rec.employeeId.toLowerCase().includes(searchLower);
                    if (!nameMatch && !idMatch) return false;
                }

                return true;
            });
        }

        // Sort by date descending, then checkIn time descending
        return records.sort((a, b) => {
            if (a.date !== b.date) {
                return b.date.localeCompare(a.date);
            }
            const timeA = a.checkIn ? new Date(a.checkIn).getTime() : 0;
            const timeB = b.checkIn ? new Date(b.checkIn).getTime() : 0;
            return timeB - timeA;
        });
    }

    /**
     * Fetches attendance records for a specific employee.
     */
    public async getAttendanceByUser(
        uid: string,
        startDate?: string,
        endDate?: string
    ): Promise<AttendanceRecord[]> {
        return this.getAttendance({
            employeeId: uid,
            startDate,
            endDate,
        });
    }

    /**
     * Fetches attendance record for a specific employee on a specific date.
     */
    public async getAttendanceByUserAndDate(
        uid: string,
        date: string
    ): Promise<AttendanceRecord | null> {
        const list = await this.getAttendance({
            employeeId: uid,
            startDate: date,
            endDate: date,
        });
        return list.length > 0 ? list[0] : null;
    }

    /**
     * Computes attendance summary statistics for a user or team.
     */
    public async getAttendanceSummary(
        uid?: string,
        startDate?: string,
        endDate?: string
    ): Promise<AttendanceSummary> {
        const records = await this.getAttendance({
            employeeId: uid,
            startDate,
            endDate,
        });

        let present = 0;
        let absent = 0;
        let late = 0;
        let wfh = 0;
        let leave = 0;
        let halfDay = 0;

        records.forEach((rec) => {
            switch (rec.status) {
                case AttendanceStatus.PRESENT:
                    present++;
                    break;
                case AttendanceStatus.ABSENT:
                    absent++;
                    break;
                case AttendanceStatus.LATE:
                    late++;
                    break;
                case AttendanceStatus.WORK_FROM_HOME:
                    wfh++;
                    break;
                case AttendanceStatus.LEAVE:
                    leave++;
                    break;
                case AttendanceStatus.HALF_DAY:
                    halfDay++;
                    break;
            }
        });

        // Excused leaves don't count against attendance percentage
        const activeDays = present + late + wfh + halfDay + absent;
        // Half day counts as 0.5 present
        const presentWeight = present + late + wfh + (halfDay * 0.5);
        const attendancePercentage = activeDays > 0
            ? Math.round((presentWeight / activeDays) * 100)
            : 100;

        return {
            presentCount: present,
            absentCount: absent,
            lateCount: late,
            wfhCount: wfh,
            leaveCount: leave,
            halfDayCount: halfDay,
            attendancePercentage,
        };
    }

    /**
     * Helper to seed diverse attendance records for testing offline.
     */
    public ensureMockDataSeeded() {
        if (typeof window === "undefined") return;

        // Check if seeded already
        const isSeeded = localStorage.getItem("hrms_attendance_seeded");
        if (isSeeded) return;

        console.log("Seeding mock attendance logs into localStorage...");

        const mockEmployees = [
            { uid: "mock-uid-admin", employeeId: "EMP-ADMIN-1001", name: "System Admin", dept: "IT Administration" },
            { uid: "mock-uid-hr", employeeId: "EMP-HR-1002", name: "HR Manager", dept: "Human Resources" },
            { uid: "mock-uid-manager", employeeId: "EMP-MANAGER-1003", name: "Project Manager", dept: "Product Management" },
            { uid: "mock-uid-emp1", employeeId: "EMP-EMPLOYEE-1004", name: "Ananya Krishnan", dept: "Engineering" },
            { uid: "mock-uid-emp2", employeeId: "EMP-EMPLOYEE-1005", name: "Rahul Sharma", dept: "Product" },
            { uid: "mock-uid-emp3", employeeId: "EMP-EMPLOYEE-1006", name: "Priya Nair", dept: "Design" },
        ];

        const today = new Date();
        // Seed records for the last 30 days
        for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() - dayOffset);
            const dayOfWeek = currentDate.getDay();

            // Skip weekends (Saturday: 6, Sunday: 0) for normal seeding
            if (dayOfWeek === 0 || dayOfWeek === 6) continue;

            const dateStr = this.getLocalDateString(currentDate);

            mockEmployees.forEach((emp) => {
                // Today's record for the user shouldn't be auto-completed so they can test check-in/out
                if (dayOffset === 0) {
                    // Only check in some other users, leave admin / current user open for live test
                    if (emp.uid === "mock-uid-emp1") {
                        // Already checked in, not checked out yet
                        const checkIn = new Date(currentDate);
                        checkIn.setHours(9, 2, 0, 0); // 09:02 AM
                        const id = `${dateStr}_${emp.uid}`;
                        const record: AttendanceRecord = {
                            id,
                            uid: emp.uid,
                            employeeId: emp.employeeId,
                            employeeName: emp.name,
                            department: emp.dept,
                            date: dateStr,
                            checkIn: checkIn.toISOString(),
                            checkOut: null,
                            totalHours: null,
                            status: AttendanceStatus.PRESENT,
                            createdAt: checkIn.toISOString(),
                            updatedAt: checkIn.toISOString(),
                        };
                        localStorage.setItem(`hrms_attendance_${id}`, JSON.stringify(record));
                    } else if (emp.uid === "mock-uid-emp2") {
                        // Already checked in and checked out
                        const checkIn = new Date(currentDate);
                        checkIn.setHours(8, 55, 0, 0); // 08:55 AM
                        const checkOut = new Date(currentDate);
                        checkOut.setHours(17, 30, 0, 0); // 05:30 PM
                        const id = `${dateStr}_${emp.uid}`;
                        const record: AttendanceRecord = {
                            id,
                            uid: emp.uid,
                            employeeId: emp.employeeId,
                            employeeName: emp.name,
                            department: emp.dept,
                            date: dateStr,
                            checkIn: checkIn.toISOString(),
                            checkOut: checkOut.toISOString(),
                            totalHours: 8.58,
                            status: AttendanceStatus.PRESENT,
                            createdAt: checkIn.toISOString(),
                            updatedAt: checkOut.toISOString(),
                        };
                        localStorage.setItem(`hrms_attendance_${id}`, JSON.stringify(record));
                    }
                    return;
                }

                // Random status weights for history: 80% Present, 10% WFH, 5% Late, 3% Leave, 2% Absent
                const rand = Math.random() * 100;
                let status: AttendanceStatus = AttendanceStatus.PRESENT;
                let isWorking = true;

                if (rand < 2) {
                    status = AttendanceStatus.ABSENT;
                    isWorking = false;
                } else if (rand < 5) {
                    status = AttendanceStatus.LEAVE;
                    isWorking = false;
                } else if (rand < 10) {
                    status = AttendanceStatus.LATE;
                } else if (rand < 20) {
                    status = AttendanceStatus.WORK_FROM_HOME;
                }

                const id = `${dateStr}_${emp.uid}`;
                let record: AttendanceRecord;

                if (isWorking) {
                    const checkIn = new Date(currentDate);
                    if (status === AttendanceStatus.LATE) {
                        // Late: 09:20 AM - 10:10 AM
                        checkIn.setHours(9, Math.floor(20 + Math.random() * 30), 0, 0);
                    } else {
                        // On Time: 08:30 AM - 09:12 AM
                        checkIn.setHours(8, Math.floor(30 + Math.random() * 42), 0, 0);
                    }

                    const checkOut = new Date(currentDate);
                    // Check out: 05:00 PM - 06:30 PM (17:00 - 18:30)
                    checkOut.setHours(17, Math.floor(Math.random() * 90), 0, 0);

                    const diffMs = checkOut.getTime() - checkIn.getTime();
                    const totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

                    // Half day override
                    let finalStatus: AttendanceStatus = status;
                    if (totalHours < 4 && status !== AttendanceStatus.LATE) {
                        finalStatus = AttendanceStatus.HALF_DAY;
                    }

                    record = {
                        id,
                        uid: emp.uid,
                        employeeId: emp.employeeId,
                        employeeName: emp.name,
                        department: emp.dept,
                        date: dateStr,
                        checkIn: checkIn.toISOString(),
                        checkOut: checkOut.toISOString(),
                        totalHours,
                        status: finalStatus,
                        createdAt: checkIn.toISOString(),
                        updatedAt: checkOut.toISOString(),
                    };
                } else {
                    // Absent or Leave
                    record = {
                        id,
                        uid: emp.uid,
                        employeeId: emp.employeeId,
                        employeeName: emp.name,
                        department: emp.dept,
                        date: dateStr,
                        checkIn: null,
                        checkOut: null,
                        totalHours: null,
                        status,
                        createdAt: currentDate.toISOString(),
                        updatedAt: currentDate.toISOString(),
                    };
                }

                localStorage.setItem(`hrms_attendance_${id}`, JSON.stringify(record));
            });
        }

        localStorage.setItem("hrms_attendance_seeded", "true");
        console.log("Mock attendance logs seeded successfully.");
    }
}

export const attendanceService = new AttendanceService();
