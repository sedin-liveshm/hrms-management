"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types/navigation";

interface RoleGuardProps {
  children: React.ReactNode;
  roles: UserRole[];
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, roles, fallback = null }: RoleGuardProps) {
  const { role } = useAuth();
  if (!role || !roles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
