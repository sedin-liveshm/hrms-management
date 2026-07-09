import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firestore";
import { isFirebaseConfigured } from "@/firebase/config";
import type { User } from "@/types/auth";

class UserService {
  private isFirebaseEnabled(): boolean {
    return isFirebaseConfigured && db !== null;
  }

  /**
   * Fetches user profile by their authentication UID.
   * Resolves by querying the "uid" field with doc ID fallback for legacy users.
   */
  public async getUserByUid(uid: string): Promise<User | null> {
    if (this.isFirebaseEnabled()) {
      try {
        // Query by uid field
        const q = query(collection(db!, "users"), where("uid", "==", uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const matchedDoc = querySnapshot.docs[0];
          return { uid: matchedDoc.data().uid, ...matchedDoc.data() } as User;
        }

        // Fallback to checking document ID directly (for legacy users)
        const userDocRef = doc(db!, "users", uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          return userDoc.data() as User;
        }
        return null;
      } catch (error) {
        console.error("Firestore getUserByUid failed:", error);
        throw error;
      }
    } else {
      // Offline mock storage fallback
      if (typeof window === "undefined") return null;

      // Search all mock hrms_profile_ keys for matching uid
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("hrms_profile_")) {
          try {
            const profile = JSON.parse(localStorage.getItem(key) || "");
            if (profile && profile.uid === uid) {
              return profile as User;
            }
          } catch (e) {
            console.error("Failed to parse local profile:", e);
          }
        }
      }

      // Legacy fallback
      const stored = localStorage.getItem(`hrms_profile_${uid}`);
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    }
  }

  /**
   * Finds a user record in the users database by email.
   */
  public async findUserByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase().trim();
    if (this.isFirebaseEnabled()) {
      try {
        const q = query(collection(db!, "users"), where("email", "==", normalizedEmail));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const matchedDoc = querySnapshot.docs[0];
          return { uid: matchedDoc.data().uid, ...matchedDoc.data() } as User;
        }
        return null;
      } catch (error) {
        console.error("Firestore findUserByEmail failed:", error);
        throw error;
      }
    } else {
      if (typeof window === "undefined") return null;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("hrms_profile_")) {
          try {
            const profile = JSON.parse(localStorage.getItem(key) || "");
            if (profile && profile.email?.toLowerCase().trim() === normalizedEmail) {
              return profile as User;
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
   * Links a Firebase Auth UID to a created employee profile.
   */
  public async linkAuthAccount(employeeId: string, uid: string): Promise<void> {
    const nowStr = new Date().toISOString();
    const updateData = {
      uid,
      authCreated: true,
      status: "active",
      activatedAt: nowStr,
      updatedAt: nowStr,
    };

    if (this.isFirebaseEnabled()) {
      try {
        const docRef = doc(db!, "users", employeeId);
        await updateDoc(docRef, updateData);
      } catch (error) {
        console.error("Firestore linkAuthAccount failed:", error);
        throw error;
      }
    } else {
      if (typeof window !== "undefined") {
        const existing = localStorage.getItem(`hrms_profile_${employeeId}`);
        if (existing) {
          try {
            const profile = JSON.parse(existing);
            const updated = { ...profile, ...updateData };
            localStorage.setItem(`hrms_profile_${employeeId}`, JSON.stringify(updated));
          } catch (e) {
            console.error("Failed to update local profile:", e);
          }
        }
      }
    }
  }

  /**
   * Updates employee status directly.
   */
  public async updateEmployeeStatus(employeeId: string, status: "invited" | "active" | "inactive"): Promise<void> {
    const nowStr = new Date().toISOString();
    const updateData = {
      status,
      updatedAt: nowStr,
    };

    if (this.isFirebaseEnabled()) {
      try {
        const docRef = doc(db!, "users", employeeId);
        await updateDoc(docRef, updateData);
      } catch (error) {
        console.error("Firestore updateEmployeeStatus failed:", error);
        throw error;
      }
    } else {
      if (typeof window !== "undefined") {
        const existing = localStorage.getItem(`hrms_profile_${employeeId}`);
        if (existing) {
          try {
            const profile = JSON.parse(existing);
            const updated = { ...profile, ...updateData };
            localStorage.setItem(`hrms_profile_${employeeId}`, JSON.stringify(updated));
          } catch (e) {
            console.error("Failed to update status for local profile:", e);
          }
        }
      }
    }
  }

  /**
   * Seeds/Creates a new user record.
   */
  public async createUser(uid: string, data: Partial<User>): Promise<User> {
    const defaultName = data.name || data.displayName || "New Employee";
    const defaultEmail = data.email || "";
    const role = data.role || "employee";

    const newUser: User = {
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
      status: "active",
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

  /**
   * Updates an existing user profile record.
   */
  public async updateUser(uid: string, data: Partial<User>): Promise<void> {
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    if (this.isFirebaseEnabled()) {
      try {
        // First try doc id directly (legacy or edit from details page)
        const docRef = doc(db!, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          await updateDoc(docRef, updateData);
          return;
        }

        // Otherwise query by uid
        const q = query(collection(db!, "users"), where("uid", "==", uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const matchedDocRef = doc(db!, "users", querySnapshot.docs[0].id);
          await updateDoc(matchedDocRef, updateData);
        }
      } catch (error) {
        console.error("Firestore updateUser failed:", error);
        throw error;
      }
    } else {
      if (typeof window !== "undefined") {
        const existing = await this.getUserByUid(uid);
        if (existing) {
          const updatedUser = { ...existing, ...updateData };
          // Sync name / displayName if either is updated
          if (data.name) updatedUser.displayName = data.name;
          else if (data.displayName) updatedUser.name = data.displayName;

          const key = existing.employeeId || uid;
          localStorage.setItem(`hrms_profile_${key}`, JSON.stringify(updatedUser));
        }
      }
    }
  }
}

export const userService = new UserService();
