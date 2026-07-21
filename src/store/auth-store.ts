import { create } from "zustand";
import type { User } from "@/types/auth";
import type { UserRole } from "@/types/navigation";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";

interface AuthState {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  isAuthenticated: boolean;
  
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  clearUser: () => void;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  loading: true,
  isAuthenticated: false,

  setUser: (user) => {
    set({
      user,
      role: user ? user.role : null,
      isAuthenticated: !!user,
      loading: false,
    });
  },

  setLoading: (loading) => set({ loading }),

  clearUser: () => {
    set({
      user: null,
      role: null,
      isAuthenticated: false,
      loading: false,
    });
  },

  login: async (email, password, rememberMe = false) => {
    set({ loading: true });
    try {
      // 1. Firebase (or mock) authentication check
      const authUser = await authService.login(email, password, rememberMe);
      
      // 2. Fetch detailed profile from Firestore (or mock db)
      const fullProfile = await userService.getUserByUid(authUser.uid);
      
      if (!fullProfile) {
        await authService.logout();
        throw new Error("Employee profile not found. Contact HR.");
      }
      
      if (fullProfile.status === "inactive") {
        await authService.logout();
        throw new Error("This account has been disabled. Contact HR.");
      }
      
      if (fullProfile.status === "invited") {
        await authService.logout();
        throw new Error("Account is not activated. Please activate your account first.");
      }
      
      set({
        user: fullProfile,
        role: fullProfile.role,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      set({
        user: null,
        role: null,
        isAuthenticated: false,
        loading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await authService.logout();
      set({
        user: null,
        role: null,
        isAuthenticated: false,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
}));
