import type { UserRole } from "@/types/navigation";

export const ROLES: Record<string, UserRole> = {
  ADMIN: "admin",
  HR: "hr",
  MANAGER: "manager",
  EMPLOYEE: "employee",
} as const;
