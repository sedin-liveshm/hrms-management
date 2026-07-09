import { db } from "@/firebase/firestore";
import { storage } from "@/firebase/storage";
import { auth, isFirebaseConfigured } from "@/firebase/config";
import { userService } from "@/services/user.service";
import type { UserProfile } from "@/types/profile";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";

class ProfileService {
  /**
   * Checks if Firebase is active and initialized.
   */
  private isFirebaseEnabled(): boolean {
    return isFirebaseConfigured && db !== null;
  }

  /**
   * Checks if Firebase Storage is active and initialized.
   */
  private isStorageEnabled(): boolean {
    return this.isFirebaseEnabled() && storage !== null;
  }

  /**
   * Fetch detailed user profile.
   */
  public async getProfile(uid: string): Promise<UserProfile | null> {
    return (await userService.getUserByUid(uid)) as UserProfile | null;
  }

  /**
   * Update permitted profile fields in database.
   */
  public async updateProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    // Enforce restricted fields (role, department, designation, employeeId cannot be modified by user)
    const sanitizedData = { ...data };
    delete sanitizedData.uid;
    delete sanitizedData.email;
    delete sanitizedData.role;
    delete sanitizedData.department;
    delete sanitizedData.designation;
    delete sanitizedData.employeeId;
    delete sanitizedData.manager;
    delete sanitizedData.joiningDate;
    delete sanitizedData.salary;
    delete sanitizedData.status;

    await userService.updateUser(uid, sanitizedData);
  }

  /**
   * Upload profile image.
   * Firebase: uploads to storage bucket under profiles/{uid}/{timestamp}_{filename}
   * Mock: converts to Base64 data URI and saves it.
   */
  public async uploadProfileImage(uid: string, file: File): Promise<string> {
    if (this.isStorageEnabled()) {
      try {
        const fileExtension = file.name.split(".").pop();
        const fileName = `avatar_${Date.now()}.${fileExtension}`;
        const storageRef = ref(storage!, `profiles/${uid}/${fileName}`);

        // Upload file bytes
        await uploadBytes(storageRef, file);

        // Retrieve download URL
        const downloadURL = await getDownloadURL(storageRef);

        // Update photoURL in Firestore user doc
        await userService.updateUser(uid, { photoURL: downloadURL });

        return downloadURL;
      } catch (error) {
        console.error("Firebase uploadProfileImage failed:", error);
        throw error;
      }
    } else {
      // Offline fallback: convert to base64 data URI
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = reader.result as string;
          try {
            await userService.updateUser(uid, { photoURL: base64String });
            resolve(base64String);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => {
          reject(new Error("Failed to read image file."));
        };
        reader.readAsDataURL(file);
      });
    }
  }

  /**
   * Remove profile image and set photoURL to null.
   */
  public async removeProfileImage(uid: string): Promise<void> {
    if (this.isFirebaseEnabled()) {
      try {
        const profile = await this.getProfile(uid);
        const currentPhotoURL = profile?.photoURL;

        // Reset photoURL in Firestore
        await userService.updateUser(uid, { photoURL: null });

        // Optionally delete the object from Firebase Storage if it matches the bucket URL
        if (this.isStorageEnabled() && currentPhotoURL && currentPhotoURL.includes("firebasestorage.googleapis.com")) {
          try {
            // Attempt to extract path and delete object (non-blocking if it fails)
            const fileRef = ref(storage!, currentPhotoURL);
            await deleteObject(fileRef);
          } catch (e) {
            console.warn("Storage image deletion skipped or failed:", e);
          }
        }
      } catch (error) {
        console.error("Firebase removeProfileImage failed:", error);
        throw error;
      }
    } else {
      await userService.updateUser(uid, { photoURL: null });
    }
  }

  /**
   * Change user log-in credentials password.
   * Reauthenticates with current password prior to updating the password.
   */
  public async changePassword(
    email: string,
    currentPass: string,
    newPass: string
  ): Promise<void> {
    if (this.isFirebaseEnabled() && auth?.currentUser) {
      try {
        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(email, currentPass);
        
        // Reauthenticate
        await reauthenticateWithCredential(user, credential);
        
        // Update password
        await updatePassword(user, newPass);
      } catch (error: unknown) {
        console.error("Firebase changePassword failed:", error);
        // Map common reauthentication errors to friendly messages
        const errCode = (error as { code?: string })?.code || "";
        if (errCode === "auth/wrong-password" || errCode === "auth/invalid-credential") {
          throw new Error("Incorrect current password. Please try again.");
        }
        throw error;
      }
    } else {
      // Mock validation sleep
      await new Promise((resolve) => setTimeout(resolve, 800));

      const normalized = email.toLowerCase().trim();
      const isAdmin = normalized === "admin@company.com";
      const isEmployee = normalized === "employee@company.com";

      // Verify simulated credentials match defaults
      if (isAdmin && currentPass !== "Admin@123!") {
        throw new Error("Incorrect current password. Please try again.");
      }
      if (isEmployee && currentPass !== "Employee@123!") {
        throw new Error("Incorrect current password. Please try again.");
      }
      if (!isAdmin && !isEmployee && currentPass.length < 8) {
        throw new Error("Incorrect current password. Please try again.");
      }
    }
  }
}

export const profileService = new ProfileService();
