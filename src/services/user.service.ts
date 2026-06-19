import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firestore";
import { isFirebaseConfigured } from "@/firebase/config";
import type { FirestoreUser } from "@/types/user";
import type { UserRole } from "@/types/navigation";

class UserService {
  private isFirebaseEnabled(): boolean {
    return isFirebaseConfigured && db !== null;
  }
  public async getUserByUid(uid: string): Promise<FirestoreUser | null> {
    if (this.isFirebaseEnabled()) {
      try {
        const userDocRef = doc(db!, "users", uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          return null;
        }
        return userDoc.data() as FirestoreUser;
      } catch (error) {
        console.error("Firestore getUserByUid failed:", error);
        throw error;
      }
    } else {
      // Offline mock storage fallback
      if (typeof window === "undefined") return null;
      const stored = localStorage.getItem(`hrms_profile_${uid}`);
      if (stored) {
        return JSON.parse(stored);
      }

      // Generate seed defaults based on email/role if it's a known test user
      let role: UserRole = "employee";
      let name = "Employee User";
      let email = "employee@company.com";
      let department = "Engineering";
      let designation = "Software Engineer";

      if (uid.includes("admin")) {
        role = "admin";
        name = "System Admin";
        email = "admin@company.com";
        department = "IT Administration";
        designation = "IT Director";
      } else if (uid.includes("hr")) {
        role = "hr";
        name = "HR Manager";
        email = "hr@company.com";
        department = "People & Culture";
        designation = "HR Business Partner";
      } else if (uid.includes("manager")) {
        role = "manager";
        name = "Project Manager";
        email = "manager@company.com";
        department = "Product Management";
        designation = "Lead PM";
      }

      const mockUser: FirestoreUser = {
        uid,
        name,
        email,
        displayName: name,
        role,
        department,
        designation,
        employeeId: `EMP-${role.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        isActive: true,
        photoURL: null,
      };

      // Store in mock DB
      localStorage.setItem(`hrms_profile_${uid}`, JSON.stringify(mockUser));
      return mockUser;
    }
  }
  public async createUser(uid: string, data: Partial<FirestoreUser>): Promise<FirestoreUser> {
    const defaultName = data.name || data.displayName || "New Employee";
    const defaultEmail = data.email || "";
    const role = data.role || "employee";
    
    const newUser: FirestoreUser = {
      uid,
      name: defaultName,
      email: defaultEmail,
      displayName: defaultName,
      role,
      department: data.department || "General",
      designation: data.designation || "Staff",
      employeeId: data.employeeId || `EMP-${role.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      isActive: data.isActive !== undefined ? data.isActive : true,
      photoURL: data.photoURL || null,
    };

    if (this.isFirebaseEnabled()) {
      try {
        await setDoc(doc(db!, "users", uid), newUser);
        return newUser;
      } catch (error) {
        console.error("Firestore createUser failed:", error);
        throw error;
      }
    } else {
      if (typeof window !== "undefined") {
        localStorage.setItem(`hrms_profile_${uid}`, JSON.stringify(newUser));
      }
      return newUser;
    }
  }

  public async updateUser(uid: string, data: Partial<FirestoreUser>): Promise<void> {
    if (this.isFirebaseEnabled()) {
      try {
        await updateDoc(doc(db!, "users", uid), data);
      } catch (error) {
        console.error("Firestore updateUser failed:", error);
        throw error;
      }
    } else {
      if (typeof window !== "undefined") {
        const existing = await this.getUserByUid(uid);
        if (existing) {
          const updatedUser = { ...existing, ...data };
          if (data.name) updatedUser.displayName = data.name;
          else if (data.displayName) updatedUser.name = data.displayName;
          
          localStorage.setItem(`hrms_profile_${uid}`, JSON.stringify(updatedUser));
        }
      }
    }
  }
}

export const userService = new UserService();
