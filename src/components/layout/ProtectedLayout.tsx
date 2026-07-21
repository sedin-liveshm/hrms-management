"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { PageLoader } from "@/components/common";
import { isRouteAllowed } from "@/config/permissions";
import { toast } from "sonner";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { loading, isAuthenticated, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (role && !isRouteAllowed(pathname, role)) {
        toast.error("Access Denied: You do not have permission to access this module.");
        router.replace("/dashboard");
      }
    }
  }, [loading, isAuthenticated, role, pathname, router]);

  if (loading || !isAuthenticated || (role && !isRouteAllowed(pathname, role))) {
    return <PageLoader />;
  }

  return <>{children}</>;
}


