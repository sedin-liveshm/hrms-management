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
import type { Employee } from "@/types/employee";

class EmployeeService {
  private isFirebaseEnabled(): boolean {
    return isFirebaseConfigured && db !== null;
  }
  public async getAllEmployees(): Promise<Employee[]> {
    if (this.isFirebaseEnabled()) {
      try {
        const querySnapshot = await getDocs(collection(db!, "users"));
        const list: Employee[] = [];
        querySnapshot.forEach((d) => {
          const data = d.data();
          // Ensure we only treat items with an employeeId or role as valid employee profiles
          if (data.employeeId || data.role) {
            list.push({
              uid: d.id,
              ...data,
            } as Employee);
          }
        });
        return list;
      } catch (error) {
        console.error("Firestore getAllEmployees failed:", error);
        throw error;
      }
    } else {
      // Offline fallback: load from LocalStorage
      if (typeof window === "undefined") return [];
      this.ensureMockDataSeeded();
      const list: Employee[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("hrms_profile_")) {
          try {
            const profile = JSON.parse(localStorage.getItem(key) || "");
            if (profile && (profile.employeeId || profile.role)) {
              list.push(profile as Employee);
            }
          } catch (e) {
            console.error("Failed to parse local profile:", e);
          }
        }
      }
      // Sort by creation date or name
      return list.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }
  }

  /**
   * Retrieves a single employee by their UID.
   */
  public async getEmployeeById(uid: string): Promise<Employee | null> {
    if (this.isFirebaseEnabled()) {
      try {
        const docRef = doc(db!, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { uid: docSnap.id, ...docSnap.data() } as Employee;
        }
        return null;
      } catch (error) {
        console.error("Firestore getEmployeeById failed:", error);
        throw error;
      }
    } else {
      if (typeof window === "undefined") return null;
      const stored = localStorage.getItem(`hrms_profile_${uid}`);
      if (stored) {
        return JSON.parse(stored) as Employee;
      }
      return null;
    }
  }

  /**
   * Creates a new employee document in the users database.
   */
  public async createEmployee(
    data: Omit<Employee, "uid" | "createdAt" | "updatedAt"> & { uid?: string }
  ): Promise<Employee> {
    const uid = data.uid || `emp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const nowStr = new Date().toISOString();

    const newEmployee: Employee = {
      ...data,
      uid,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    if (this.isFirebaseEnabled()) {
      try {
        const docRef = doc(db!, "users", uid);
        await setDoc(docRef, newEmployee);
        return newEmployee;
      } catch (error) {
        console.error("Firestore createEmployee failed:", error);
        throw error;
      }
    } else {
      if (typeof window !== "undefined") {
        localStorage.setItem(`hrms_profile_${uid}`, JSON.stringify(newEmployee));
      }
      return newEmployee;
    }
  }

  /**
   * Updates an existing employee document.
   */
  public async updateEmployee(uid: string, data: Partial<Employee>): Promise<void> {
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    if (this.isFirebaseEnabled()) {
      try {
        const docRef = doc(db!, "users", uid);
        await setDoc(docRef, updateData, { merge: true });
      } catch (error) {
        console.error("Firestore updateEmployee failed:", error);
        throw error;
      }
    } else {
      if (typeof window !== "undefined") {
        const existing = await this.getEmployeeById(uid);
        if (existing) {
          const merged = { ...existing, ...updateData };
          localStorage.setItem(`hrms_profile_${uid}`, JSON.stringify(merged));
        } else {
          throw new Error("Employee not found in local mock database");
        }
      }
    }
  }

  /**
   * Soft deletes an employee (sets status to inactive and isActive to false).
   */
  public async deleteEmployee(uid: string): Promise<void> {
    return this.updateEmployee(uid, {
      status: "inactive",
    });
  }

  /**
   * Helper to pre-seed localStorage with diverse employees for demo/mock mode
   */
  private ensureMockDataSeeded() {
    if (typeof window === "undefined") return;

    // Check if there are already any profile keys in localStorage
    let hasProfiles = false;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("hrms_profile_")) {
        hasProfiles = true;
        break;
      }
    }

    if (!hasProfiles) {
      console.log("Seeding mock employees into localStorage...");
      const mockList: Employee[] = [
        {
          uid: "mock-uid-admin",
          employeeId: "EMP-ADMIN-1001",
          name: "System Admin",
          email: "admin@company.com",
          phone: "9876543210",
          gender: "male",
          dateOfBirth: "1990-01-01",
          department: "IT Administration",
          designation: "IT Director",
          role: "admin",
          joiningDate: "2020-01-01",
          salary: 150000,
          status: "active",
          photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString(),
        },
        {
          uid: "mock-uid-hr",
          employeeId: "EMP-HR-1002",
          name: "HR Manager",
          email: "hr@company.com",
          phone: "9876543211",
          gender: "female",
          dateOfBirth: "1992-05-10",
          department: "Human Resources",
          designation: "HR Business Partner",
          role: "hr",
          joiningDate: "2021-06-15",
          salary: 95000,
          status: "active",
          photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 200).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 200).toISOString(),
        },
        {
          uid: "mock-uid-manager",
          employeeId: "EMP-MANAGER-1003",
          name: "Project Manager",
          email: "manager@company.com",
          phone: "9876543212",
          gender: "male",
          dateOfBirth: "1988-11-20",
          department: "Product Management",
          designation: "Lead PM",
          role: "manager",
          joiningDate: "2022-02-01",
          salary: 120000,
          status: "active",
          photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 100).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 100).toISOString(),
        },
        {
          uid: "mock-uid-emp1",
          employeeId: "EMP-EMPLOYEE-1004",
          name: "Ananya Krishnan",
          email: "ananya@company.com",
          phone: "9876543213",
          gender: "female",
          dateOfBirth: "1995-08-15",
          department: "Engineering",
          designation: "Software Engineer",
          role: "employee",
          joiningDate: "2023-01-15",
          salary: 80000,
          status: "active",
          photoURL: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 50).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 50).toISOString(),
        },
        {
          uid: "mock-uid-emp2",
          employeeId: "EMP-EMPLOYEE-1005",
          name: "Rahul Sharma",
          email: "rahul@company.com",
          phone: "9876543214",
          gender: "male",
          dateOfBirth: "1994-03-22",
          department: "Product",
          designation: "Product Designer",
          role: "employee",
          joiningDate: "2022-08-01",
          salary: 90000,
          status: "active",
          photoURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
        },
        {
          uid: "mock-uid-emp3",
          employeeId: "EMP-EMPLOYEE-1006",
          name: "Priya Nair",
          email: "priya@company.com",
          phone: "9876543215",
          gender: "female",
          dateOfBirth: "1996-12-05",
          department: "Design",
          designation: "UI Designer",
          role: "employee",
          joiningDate: "2023-03-20",
          salary: 75000,
          status: "on-leave",
          photoURL: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
        }
      ];

      mockList.forEach((emp) => {
        localStorage.setItem(`hrms_profile_${emp.uid}`, JSON.stringify(emp));
      });
    }
  }
}

export const employeeService = new EmployeeService();
