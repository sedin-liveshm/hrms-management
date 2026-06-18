"use client";

import React, { createContext, useEffect, useState, useMemo } from "react";
import type { User, AuthContextType } from "@/types/auth";
import { authService } from "@/services/auth.service";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = authService.subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string, rememberMe = false) => {
    setLoading(true);
    try {
      const authenticatedUser = await authService.login(email, password, rememberMe);
      setUser(authenticatedUser);
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await authService.sendResetLink(email);
    } catch (error) {
      throw error;
    }
  };

  const confirmResetPassword = async (code: string, newPassword: string) => {
    try {
      await authService.resetPassword(code, newPassword);
    } catch (error) {
      throw error;
    }
  };

  const isAuthenticated = !!user;

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated,
      login,
      logout,
      resetPassword,
      confirmResetPassword,
    }),
    [user, loading, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
