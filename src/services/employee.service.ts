import { db } from "@/firebase/firestore";
import { isFirebaseConfigured } from "@/firebase/config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import type { Employee } from "@/types/employee";

class EmployeeService {
  /**
   * Checks if Firestore is active and initialized.
   */
  private isFirebaseEnabled(): boolean {
    return isFirebaseConfigured && db !== null;
  }

  /**
   * Retrieves all employees from the system (Firestore or Mock LocalStorage).
   */
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
              uid: data.uid || d.id, // Fallback to doc ID if uid is null (keeps list keys unique)
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
              list.push({
                ...profile,
                uid: profile.uid || profile.employeeId,
              } as Employee);
            }
          } catch (e) {
            console.error("Failed to parse local profile:", e);
          }
        }
      }
      // Sort by creation date
      return list.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }
  }

  /**
   * Retrieves a single employee by their UID or Employee ID.
   */
  public async getEmployeeById(id: string): Promise<Employee | null> {
    if (this.isFirebaseEnabled()) {
      try {
        // 1. Try directly via doc id (works for employeeId or legacy uid)
        const docRef = doc(db!, "users", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          return { uid: data.uid || docSnap.id, ...data } as Employee;
        }

        // 2. Try querying by the uid field
        const q = query(collection(db!, "users"), where("uid", "==", id));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const matchedDoc = querySnapshot.docs[0];
          const data = matchedDoc.data();
          return { uid: data.uid || matchedDoc.id, ...data } as Employee;
        }

        return null;
      } catch (error) {
        console.error("Firestore getEmployeeById failed:", error);
        throw error;
      }
    } else {
      if (typeof window === "undefined") return null;

      // Try fetching by employeeId key first
      const stored = localStorage.getItem(`hrms_profile_${id}`);
      if (stored) {
        const parsed = JSON.parse(stored) as Employee;
        return { ...parsed, uid: parsed.uid || parsed.employeeId };
      }

      // Search mock local records for matching uid or employeeId
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("hrms_profile_")) {
          try {
            const profile = JSON.parse(localStorage.getItem(key) || "");
            if (profile && (profile.uid === id || profile.employeeId === id)) {
              return { ...profile, uid: profile.uid || profile.employeeId } as Employee;
            }
          } catch (e) {
            console.error("Failed to parse local profile:", e);
          }
        }
      }
      return null;
    }
  }

  /**
   * Creates a new employee document in the users database.
   * Keyed by employeeId with uid set to null initially.
   */
  public async createEmployee(
    data: Omit<Employee, "uid" | "createdAt" | "updatedAt" | "authCreated" | "activatedAt">
  ): Promise<Employee> {
    const nowStr = new Date().toISOString();

    const newEmployee: Employee = {
      ...data,
      uid: null, // No auth UID exists yet
      status: "invited",
      authCreated: false,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    if (this.isFirebaseEnabled()) {
      try {
        const docRef = doc(db!, "users", data.employeeId);
        await setDoc(docRef, newEmployee);
        return newEmployee;
      } catch (error) {
        console.error("Firestore createEmployee failed:", error);
        throw error;
      }
    } else {
      if (typeof window !== "undefined") {
        localStorage.setItem(`hrms_profile_${data.employeeId}`, JSON.stringify(newEmployee));
      }
      return newEmployee;
    }
  }

  /**
   * Updates an existing employee document.
   * Resolves target document by ID or UID query.
   */
  public async updateEmployee(id: string, data: Partial<Employee>): Promise<void> {
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    if (this.isFirebaseEnabled()) {
      try {
        // 1. Try directly via doc id
        const docRef = doc(db!, "users", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          await updateDoc(docRef, updateData);
          return;
        }

        // 2. Query by uid field
        const q = query(collection(db!, "users"), where("uid", "==", id));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const matchedDocRef = doc(db!, "users", querySnapshot.docs[0].id);
          await updateDoc(matchedDocRef, updateData);
          return;
        }

        throw new Error(`Employee profile not found with ID: ${id}`);
      } catch (error) {
        console.error("Firestore updateEmployee failed:", error);
        throw error;
      }
    } else {
      if (typeof window !== "undefined") {
        const existing = await this.getEmployeeById(id);
        if (existing) {
          const merged = { ...existing, ...updateData };
          const key = existing.employeeId;
          localStorage.setItem(`hrms_profile_${key}`, JSON.stringify(merged));
        } else {
          throw new Error("Employee not found in local mock database");
        }
      }
    }
  }

  /**
   * Soft deletes an employee (sets status to inactive).
   */
  public async deleteEmployee(uid: string): Promise<void> {
    return this.updateEmployee(uid, {
      status: "inactive",
    });
  }

  /**
   * Return employees where role == "manager"
   */
  public async getManagers(): Promise<Employee[]> {
    if (this.isFirebaseEnabled()) {
      try {
        const q = query(collection(db!, "users"), where("role", "==", "manager"));
        const querySnapshot = await getDocs(q);
        const list: Employee[] = [];
        querySnapshot.forEach((d) => {
          const data = d.data();
          list.push({ uid: data.uid || d.id, ...data } as Employee);
        });
        return list;
      } catch (error) {
        console.error("Firestore getManagers failed:", error);
        throw error;
      }
    } else {
      const all = await this.getAllEmployees();
      return all.filter((emp) => emp.role === "manager");
    }
  }

  /**
   * Return employees managed by the given managerId
   */
  public async getEmployeesByManager(managerId: string): Promise<Employee[]> {
    if (this.isFirebaseEnabled()) {
      try {
        const q = query(
          collection(db!, "users"),
          where("managerId", "==", managerId)
        );
        const querySnapshot = await getDocs(q);
        const list: Employee[] = [];
        querySnapshot.forEach((d) => {
          const data = d.data();
          list.push({ uid: data.uid || d.id, ...data } as Employee);
        });
        return list;
      } catch (error) {
        console.error("Firestore getEmployeesByManager failed:", error);
        throw error;
      }
    } else {
      const all = await this.getAllEmployees();
      return all.filter((emp) => emp.managerId === managerId);
    }
  }

  /**
   * Updates an employee's direct manager details
   */
  public async updateEmployeeManager(
    employeeId: string,
    manager: { managerId: string | null; managerName: string | null }
  ): Promise<void> {
    return this.updateEmployee(employeeId, {
      managerId: manager.managerId,
      managerName: manager.managerName,
      manager: manager.managerName || "", // Sync legacy manager text field
    });
  }

  /**
   * Helper to pre-seed localStorage with diverse employees for demo/mock mode
   */
  private ensureMockDataSeeded() {
    if (typeof window === "undefined") return;

    // Clear legacy keys that do not contain EMP-
    const legacyKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("hrms_profile_") && !key.includes("EMP-")) {
        legacyKeys.push(key);
      }
    }
    legacyKeys.forEach((k) => localStorage.removeItem(k));

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
          authCreated: true,
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
          authCreated: true,
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
          authCreated: true,
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
          authCreated: true,
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
          authCreated: true,
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
          status: "active",
          authCreated: true,
          photoURL: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
        }
      ];

      mockList.forEach((emp) => {
        localStorage.setItem(`hrms_profile_${emp.employeeId}`, JSON.stringify(emp));
      });
    }
  }
}

export const employeeService = new EmployeeService();
