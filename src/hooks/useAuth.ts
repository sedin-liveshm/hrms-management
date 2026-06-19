"use client";

import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/services/auth.service";


export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const loading = useAuthStore((state) => state.loading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  const resetPassword = async (email: string) => {
    await authService.sendResetLink(email);
  };

  const confirmResetPassword = async (code: string, newPassword: string) => {
    await authService.resetPassword(code, newPassword);
  };

  return {
    user,
    role,
    loading,
    isAuthenticated,
    login,
    logout,
    resetPassword,
    confirmResetPassword,
  };
}

