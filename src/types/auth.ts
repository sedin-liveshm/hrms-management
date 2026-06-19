import type { UserRole } from "./navigation";

export interface User {
  uid: string;
  name: string | null;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>; // Sends reset link
  confirmResetPassword: (code: string, newPassword: string) => Promise<void>; // Updates to new password
}


export interface PasswordStrength {
  score: number; // 0 to 5
  label: "Very Weak" | "Weak" | "Fair" | "Good" | "Strong";
  color: string; // CSS class color
  checks: {
    length: boolean;
    upper: boolean;
    lower: boolean;
    number: boolean;
    special: boolean;
  };
}