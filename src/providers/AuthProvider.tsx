"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import { usePathname } from "next/navigation";
import { PageLoader } from "@/components/common";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);
  const loading = useAuthStore((state) => state.loading);

  useEffect(() => {
    // 1. Subscribe to Auth status changes from Firebase or Mock
    const unsubscribe = authService.subscribeToAuthChanges(async (authUser) => {
      if (authUser) {
        try {
          const fullProfile = await userService.getUserByUid(authUser.uid);
          
          if (!fullProfile || fullProfile.status === "inactive" || fullProfile.status === "invited") {
            await authService.logout();
            clearUser();
            return;
          }
          
          setUser(fullProfile);
        } catch (error) {
          console.error("AuthProvider: failed to fetch profile for user:", authUser.uid, error);
          clearUser();
        }
      } else {
        clearUser();
      }
    });

    return () => unsubscribe();
  }, [setUser, clearUser]);

  const pathname = usePathname();

  // If the path is a public auth page (e.g. login, reset, forgot password),
  // we do not block rendering with the page skeleton, to avoid flashing.
  const isPublicRoute =
    pathname === "/login" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  if (loading && !isPublicRoute) {
    // Render the dashboard skeleton during the initial loading phase
    return <PageLoader />;
  }

  return <>{children}</>;
}
