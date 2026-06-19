import type { UserRole } from "@/types/navigation";

export const MODULE_PERMISSIONS: Record<string, UserRole[]> = {
    dashboard: ["admin", "hr", "manager", "employee"],
    announcements: ["admin", "hr", "manager", "employee"],
    profile: ["admin", "hr", "manager", "employee"],
    leave: ["admin", "hr", "manager", "employee"],
    attendance: ["admin", "hr", "manager", "employee"],
    employees: ["admin", "hr"],
    payroll: ["admin", "hr"],
    settings: ["admin"],
};

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

    "/organization": "employees",
    "/payroll": "payroll",
    "/expenses": "payroll",

    "/settings": "settings",
};

export function isRouteAllowed(pathname: string, role: UserRole): boolean {
    const matchedRoute = Object.keys(ROUTE_TO_MODULE_MAP)
        .sort((a, b) => b.length - a.length)
        .find((route) => pathname === route || pathname.startsWith(route + "/"));
    if (!matchedRoute) {
        return true;
    }
    const moduleName = ROUTE_TO_MODULE_MAP[matchedRoute];
    const allowedRoles = MODULE_PERMISSIONS[moduleName];
    return allowedRoles ? allowedRoles.includes(role) : false;
}
