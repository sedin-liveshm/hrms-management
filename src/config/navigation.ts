/**
 * Navigation Config — src/config/navigation.ts
 *
 * WHY THIS EXISTS:
 * Configuration-driven navigation is an enterprise pattern that decouples
 * the navigation structure from rendering logic. To add, remove, or reorder
 * nav items, you ONLY edit this file. Zero component changes needed.
 *
 * DESIGN DECISIONS:
 * - Icons imported from lucide-react as component references (not JSX)
 * - Every item has a `roles` array for RBAC filtering at render time
 * - `id` fields use kebab-case constants — no magic strings in components
 * - Groups map 1:1 to Icon Rail entries
 * - Items within each group populate the middle Navigation Panel
 *
 * SOLID: Open/Closed — new nav entries added here, no existing code changes.
 * DRY: One config file drives both the icon rail and the nav panel.
 */

import {
    LayoutDashboard,
    Megaphone,
    Calendar,
    User,
    Clock,
    Umbrella,
    Timer,
    FileText,
    CreditCard,
    Users,
    ClipboardCheck,
    TrendingUp,
    Building2,
    Layers,
    Briefcase,
    DollarSign,
    Receipt,
    Settings,
    UserCog,
    Shield,
    type LucideIcon,
} from "lucide-react";

import type { NavigationConfig, NavigationGroup } from "@/types/navigation";
export const NAV_GROUP_IDS = {
    HOME: "home",
    ME: "me",
    TEAM: "team",
    ORGANIZATION: "organization",
    FINANCE: "finance",
    SETTINGS: "settings",
} as const;

export type NavGroupId = (typeof NAV_GROUP_IDS)[keyof typeof NAV_GROUP_IDS];

export const navigationConfig: NavigationConfig = [
    // ── Home Group
    {
        id: NAV_GROUP_IDS.HOME,
        label: "Home",
        icon: LayoutDashboard,
        roles: ["admin", "hr", "manager", "employee"],
        items: [
            {
                id: "dashboard",
                label: "Dashboard",
                href: "/dashboard",
                icon: LayoutDashboard,
                roles: ["admin", "hr", "manager", "employee"],
            },
            {
                id: "announcements",
                label: "Announcements",
                href: "/announcements",
                icon: Megaphone,
                roles: ["admin", "hr", "manager", "employee"],
            },
            {
                id: "calendar",
                label: "Calendar",
                href: "/calendar",
                icon: Calendar,
                roles: ["admin", "hr", "manager", "employee"],
            },
        ],
    },

    // ── Me Group 
    {
        id: NAV_GROUP_IDS.ME,
        label: "Me",
        icon: User,
        roles: ["admin", "hr", "manager", "employee"],
        items: [
            {
                id: "profile",
                label: "Profile",
                href: "/profile",
                icon: User,
                roles: ["admin", "hr", "manager", "employee"],
            },
            {
                id: "my-attendance",
                label: "Attendance",
                href: "/attendance",
                icon: Clock,
                roles: ["admin", "hr", "manager", "employee"],
            },
            {
                id: "my-leave",
                label: "Leave",
                href: "/leave",
                icon: Umbrella,
                roles: ["admin", "hr", "manager", "employee"],
            },
            {
                id: "timesheet",
                label: "Timesheet",
                href: "/timesheet",
                icon: Timer,
                roles: ["admin", "hr", "manager", "employee"],
            },
            {
                id: "documents",
                label: "Documents",
                href: "/documents",
                icon: FileText,
                roles: ["admin", "hr", "manager", "employee"],
            },
            {
                id: "payslips",
                label: "Payslips",
                href: "/payslips",
                icon: CreditCard,
                roles: ["admin", "hr", "manager", "employee"],
            },
        ],
    },

    // ── Team Group
    {
        id: NAV_GROUP_IDS.TEAM,
        label: "Team",
        icon: Users,
        roles: ["admin", "hr", "manager"],
        items: [
            {
                id: "employees",
                label: "Employees",
                href: "/employees",
                icon: Users,
                roles: ["admin", "hr", "manager"],
            },
            {
                id: "team-attendance",
                label: "Attendance",
                href: "/team/attendance",
                icon: ClipboardCheck,
                roles: ["admin", "hr", "manager"],
            },
            {
                id: "leave-approval",
                label: "Leave Approval",
                href: "/team/leave-approval",
                icon: Umbrella,
                roles: ["admin", "hr", "manager"],
            },
            {
                id: "team-timesheets",
                label: "Timesheet Approvals",
                href: "/team/timesheets",
                icon: Timer,
                roles: ["admin", "hr", "manager"],
            },
            {
                id: "performance",
                label: "Performance",
                href: "/team/performance",
                icon: TrendingUp,
                roles: ["admin", "hr", "manager"],
            },
        ],
    },

    // ── Organization Group
    {
        id: NAV_GROUP_IDS.ORGANIZATION,
        label: "Organization",
        icon: Building2,
        roles: ["admin", "hr", "manager", "employee"],
        items: [
            {
                id: "structure",
                label: "Org Structure",
                href: "/organization",
                icon: Building2,
                roles: ["admin", "hr", "manager", "employee"],
            },
            {
                id: "departments",
                label: "Departments",
                href: "/organization/departments",
                icon: Building2,
                roles: ["admin", "hr"],
            },
            {
                id: "designations",
                label: "Designations",
                href: "/organization/designations",
                icon: Layers,
                roles: ["admin", "hr"],
            },
            {
                id: "positions",
                label: "Positions",
                href: "/organization/positions",
                icon: Briefcase,
                roles: ["admin", "hr"],
            },
        ],
    },

    // ── Finance Grou
    {
        id: NAV_GROUP_IDS.FINANCE,
        label: "Finance",
        icon: DollarSign,
        roles: ["admin", "hr", "manager", "employee"],
        items: [
            {
                id: "payroll",
                label: "Payroll",
                href: "/payroll",
                icon: DollarSign,
                roles: ["admin", "hr", "manager", "employee"],
            },
            {
                id: "company-timesheets",
                label: "All Timesheets",
                href: "/payroll/timesheets",
                icon: Timer,
                roles: ["admin", "hr"],
            },
            {
                id: "expenses",
                label: "Expenses",
                href: "/expenses",
                icon: Receipt,
                roles: ["admin", "hr"],
            },
        ],
    },

    // ── Settings Group 
    {
        id: NAV_GROUP_IDS.SETTINGS,
        label: "Settings",
        icon: Settings,
        roles: ["admin"],
        items: [
            {
                id: "settings-general",
                label: "General",
                href: "/settings",
                icon: Settings,
                roles: ["admin"],
            },
            {
                id: "users",
                label: "Users",
                href: "/settings/users",
                icon: UserCog,
                roles: ["admin"],
            },
            {
                id: "roles",
                label: "Roles",
                href: "/settings/roles",
                icon: Shield,
                roles: ["admin"],
            },
        ],
    },
];

// ─── Helper Functions 
export function getFilteredNavigation(
    config: NavigationConfig,
    role: string
): NavigationConfig {
    return config
        .filter((group) => group.roles.includes(role as never))
        .map((group) => ({
            ...group,
            items: group.items.filter((item) => item.roles.includes(role as never)),
        }));
}
export function getNavigationGroup(
    config: NavigationConfig,
    groupId: string
): NavigationGroup | undefined {
    return config.find((group) => group.id === groupId);
}
export function getDefaultGroupId(config: NavigationConfig): string {
    return config[0]?.id ?? NAV_GROUP_IDS.HOME;
}
