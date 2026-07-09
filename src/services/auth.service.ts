import {
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    confirmPasswordReset,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    createUserWithEmailAndPassword,
    User as FirebaseUser,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/firebase/config";
import type { User } from "@/types/auth";
import type { UserRole } from "@/types/navigation";
import { userService } from "./user.service";

// ─── Firebase Error Parser ──────────────────────────────────────────────────
export function handleAuthError(error: unknown): string {
    const code = (error as { code?: string })?.code || "";
    console.error("Auth error occurred:", error);

    switch (code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
            return "Invalid email address or password. Please try again.";
        case "auth/user-disabled":
            return "This account has been disabled. Please contact your HR administrator.";
        case "auth/too-many-requests":
            return "Too many failed login attempts. This account has been temporarily locked. Please try again later.";
        case "auth/network-request-failed":
            return "Network connection issue. Please check your internet connection and try again.";
        case "auth/email-already-in-use":
            return "An account with this email address already exists.";
        case "auth/expired-action-code":
            return "The password reset link has expired. Please request a new one.";
        case "auth/invalid-action-code":
            return "The password reset link is invalid or has already been used.";
        case "auth/weak-password":
            return "The password is too weak. Please choose a stronger password.";
        default:
            return (error as { message?: string })?.message || "An unexpected error occurred. Please try again.";
    }
}

function determineRole(email: string | null): UserRole {
    if (!email) return "employee";
    const normalized = email.toLowerCase();
    if (normalized.includes("admin")) return "admin";
    if (normalized.includes("hr")) return "hr";
    if (normalized.includes("manager")) return "manager";
    return "employee";
}

// ─── Map Firebase User → HRMS User ──────────────────────────────────────────
function mapFirebaseUser(firebaseUser: FirebaseUser): User {
    return {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split("@")[0] : "User"),
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split("@")[0] : "User"),
        photoURL: firebaseUser.photoURL,
        role: determineRole(firebaseUser.email),
    };
}

// ─── Mock Session State ─────────────────────────────────────────────────────
// Used only when isFirebaseConfigured is false. Matches Firebase local/session persistence.
let mockUserChangeListener: ((user: User | null) => void) | null = null;
let currentMockUser: User | null = null;

function getStoredMockUser(): User | null {
    if (typeof window === "undefined") return null;
    const local = localStorage.getItem("hrms_mock_user");
    if (local) return JSON.parse(local);
    const session = sessionStorage.getItem("hrms_mock_user");
    if (session) return JSON.parse(session);
    return null;
}

// ─── Service Class Implementation ───────────────────────────────────────────
class AuthService {
    /**
     * Check if Firebase is active
     */
    public isFirebaseEnabled(): boolean {
        return isFirebaseConfigured && auth !== null;
    }

    /**
     * Authenticate a user with email and password
     */
    public async login(email: string, password: string, rememberMe = false): Promise<User> {
        const normalizedEmail = email.trim();

        if (this.isFirebaseEnabled()) {
            try {
                // Enforce persistence strategy based on "Remember Me"
                await setPersistence(
                    auth!,
                    rememberMe ? browserLocalPersistence : browserSessionPersistence
                );
                const credential = await signInWithEmailAndPassword(auth!, normalizedEmail, password);
                return mapFirebaseUser(credential.user);
            } catch (error) {
                throw new Error(handleAuthError(error));
            }
        } else {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 800));

            // Preset Mock Accounts Validation
            // Any other email compiles fine, but these are our predefined test accounts
            const isTestAdmin = normalizedEmail === "admin@company.com" && password === "Admin@123!";
            const isTestEmployee = normalizedEmail === "employee@company.com" && password === "Employee@123!";
            const isGenericValid = normalizedEmail.endsWith("@company.com") && password.length >= 8;

            if (!isTestAdmin && !isTestEmployee && !isGenericValid) {
                throw new Error("Invalid email address or password. Try admin@company.com / Admin@123!");
            }

            const role = determineRole(normalizedEmail);
            const displayName = normalizedEmail.split("@")[0].replace(/^\w/, (c) => c.toUpperCase()) + " M";

            const user: User = {
                uid: `mock-uid-${role}-${Date.now()}`,
                email: normalizedEmail,
                displayName,
                name: displayName,
                photoURL: null,
                role,
            };

            currentMockUser = user;
            if (typeof window !== "undefined") {
                if (rememberMe) {
                    localStorage.setItem("hrms_mock_user", JSON.stringify(user));
                } else {
                    sessionStorage.setItem("hrms_mock_user", JSON.stringify(user));
                }
            }

            if (mockUserChangeListener) {
                mockUserChangeListener(user);
            }

            return user;
        }
    }

    public async logout(): Promise<void> {
        if (this.isFirebaseEnabled()) {
            try {
                await signOut(auth!);
            } catch (error) {
                throw new Error(handleAuthError(error));
            }
        } else {
            await new Promise((resolve) => setTimeout(resolve, 400));
            currentMockUser = null;
            if (typeof window !== "undefined") {
                localStorage.removeItem("hrms_mock_user");
                sessionStorage.removeItem("hrms_mock_user");
            }
            if (mockUserChangeListener) {
                mockUserChangeListener(null);
            }
        }
    }

    /**
     * Dispatch password reset email
     */
    public async sendResetLink(email: string): Promise<void> {
        const normalizedEmail = email.trim();

        if (this.isFirebaseEnabled()) {
            try {
                await sendPasswordResetEmail(auth!, normalizedEmail);
            } catch (error) {
                throw new Error(handleAuthError(error));
            }
        } else {
            await new Promise((resolve) => setTimeout(resolve, 800));
            // In mock mode, simply simulate success for any company email
            if (!normalizedEmail.includes("@")) {
                throw new Error("Invalid email address format.");
            }
        }
    }

    /**
     * Reset password with action code
     */
    public async resetPassword(code: string, newPassword: string): Promise<void> {
        if (this.isFirebaseEnabled()) {
            try {
                await confirmPasswordReset(auth!, code, newPassword);
            } catch (error) {
                throw new Error(handleAuthError(error));
            }
        } else {
            await new Promise((resolve) => setTimeout(resolve, 800));
            if (!code || code === "invalid") {
                throw new Error("The password reset token is invalid or has expired.");
            }
        }
    }

    /**
     * Subscribe to authentication status updates
     */
    public subscribeToAuthChanges(callback: (user: User | null) => void): () => void {
        if (this.isFirebaseEnabled()) {
            return onAuthStateChanged(auth!, (firebaseUser) => {
                if (firebaseUser) {
                    callback(mapFirebaseUser(firebaseUser));
                } else {
                    callback(null);
                }
            });
        } else {
            // Mock subscription loop
            mockUserChangeListener = callback;
            const initialUser = getStoredMockUser();
            currentMockUser = initialUser;

            // Delay callback slightly to simulate async Firebase check
            const timer = setTimeout(() => {
                callback(currentMockUser);
            }, 500);

            return () => {
                clearTimeout(timer);
                mockUserChangeListener = null;
            };
        }
    }

    /**
     * Find invited employee details by email
     */
    public async findEmployeeByEmail(email: string): Promise<User | null> {
        return await userService.findUserByEmail(email);
    }

    /**
     * Activate employee account
     * 1. Creates authentication credentials
     * 2. Links Auth UID to the employee's profile document
     * 3. Logs out the newly created automatic user session
     */
    public async activateEmployeeAccount(
        email: string,
        password: string,
        employeeId: string
    ): Promise<void> {
        if (this.isFirebaseEnabled()) {
            try {
                const credential = await createUserWithEmailAndPassword(auth!, email, password);
                const uid = credential.user.uid;

                // Update Firestore profile
                await userService.linkAuthAccount(employeeId, uid);

                // Sign out the new session immediately
                await signOut(auth!);
            } catch (error) {
                throw new Error(handleAuthError(error));
            }
        } else {
            // Offline fallback: simulate delay
            await new Promise((resolve) => setTimeout(resolve, 800));

            const mockUid = `mock-uid-activated-${Date.now()}`;
            await userService.linkAuthAccount(employeeId, mockUid);
        }
    }
}

export const authService = new AuthService();
