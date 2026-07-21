import type { UserRole } from "@/types/navigation";

// Module name to allowed roles map (defines module level access)
export const MODULE_PERMISSIONS: Record<string, UserRole[]> = {
  dashboard: ["admin", "hr", "manager", "employee"],
  announcements: ["admin", "hr", "manager", "employee"],
  profile: ["admin", "hr", "manager", "employee"],
  leave: ["admin", "hr", "manager", "employee"],
  attendance: ["admin", "hr", "manager", "employee"],
  employees: ["admin", "hr", "manager"],      // Employees List/CRUD: admin, hr, manager
  payroll: ["admin", "hr"],        // Payroll module: admin, hr
  settings: ["admin"],             // Settings module: admin
};

// Route prefix to module mapping
export const ROUTE_TO_MODULE_MAP: Record<string, string> = {
  "/dashboard": "dashboard",
  "/announcements": "announcements",
  "/calendar": "dashboard",
  "/profile": "profile",
  "/attendance": "attendance",
  "/leave": "leave",
  "/timesheet": "attendance",
  "/documents": "profile",
  "/payslips": "profile",
  
  "/employees": "employees",
  "/team/attendance": "attendance",
  "/team/leave-approval": "leave",
  "/team/performance": "employees",
  
  "/organization": "dashboard",
  "/payroll": "payroll",
  "/expenses": "payroll",
  
  "/settings": "settings",
};

/**
 * Validates if the user's role is allowed to access a given URL path.
 * Matches routes dynamically and looks up permissions based on modules.
 */
export function isRouteAllowed(pathname: string, role: UserRole): boolean {
  // Find matching route prefix (most specific first)
  const matchedRoute = Object.keys(ROUTE_TO_MODULE_MAP)
    .sort((a, b) => b.length - a.length)
    .find((route) => pathname === route || pathname.startsWith(route + "/"));

  if (!matchedRoute) {
    // Allow routes that aren't specifically mapped (like /login, /unauthorized)
    return true;
  }

  const moduleName = ROUTE_TO_MODULE_MAP[matchedRoute];
  const allowedRoles = MODULE_PERMISSIONS[moduleName];

  return allowedRoles ? allowedRoles.includes(role) : false;
}

// Granular permission tokens for advanced access control
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    "employee:view_all",
    "employee:view_team",
    "employee:view_self",
    "attendance:view_all",
    "attendance:view_team",
    "attendance:view_self",
    "leave:approve_all",
    "leave:approve_team",
  ],
  hr: [
    "employee:view_all",
    "employee:view_team",
    "employee:view_self",
    "attendance:view_all",
    "attendance:view_team",
    "attendance:view_self",
    "leave:approve_all",
    "leave:approve_team",
  ],
  manager: [
    "employee:view_team",
    "employee:view_self",
    "attendance:view_team",
    "attendance:view_self",
    "leave:approve_team",
  ],
  employee: [
    "employee:view_self",
    "attendance:view_self",
  ],
};

/**
 * Validates if a user role has the required permission token.
 */
export function hasPermission(role: UserRole | null | undefined, permission: string): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}
