
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { PageLoader } from "@/components/common";
import type { UserRole } from "@/types/navigation";

interface ProtectedLayoutProps {
  children: React.ReactNode;
  /** Current user's role — used for RBAC nav filtering */
  role?: UserRole;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return <PageLoader />;
  }

  return <>{children}</>;
}

