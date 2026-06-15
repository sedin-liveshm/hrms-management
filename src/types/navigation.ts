import type { LucideIcon } from "lucide-react";
export type UserRole = "admin" | "hr" | "manager" | "employee";
export interface NavigationItem {
    /** Unique identifier — used for active state tracking, never use href as key */
    id: string;
    /** Display label */
    label: string;
    /** Target route (App Router path) */
    href: string;
    /** Lucide icon component — passed as a reference, not JSX */
    icon: LucideIcon;
    /** RBAC: which roles can see this item. Empty array = visible to all. */
    roles: UserRole[];
    /** Optional badge count (e.g. pending approvals) */
    badge?: number;
    /** Whether this item opens in a new tab */
    external?: boolean;
}

export interface NavigationGroup {
    /** Unique identifier for this group */
    id: string;
    /** Display label shown in tooltips and panel header */
    label: string;
    /** Icon shown in the Icon Rail */
    icon: LucideIcon;
    /** RBAC: which roles can see this group */
    roles: UserRole[];
    /** The items shown in the middle panel when this group is active */
    items: NavigationItem[];
}

export type NavigationConfig = NavigationGroup[];
export interface NavigationState {
    /** The currently active group id (e.g. "me", "team") */
    activeGroupId: string;
    /** Whether the navigation panel (middle column) is collapsed */
    isPanelCollapsed: boolean;
    /** Whether the mobile sheet drawer is open */
    isMobileOpen: boolean;
}

export interface NavigationContextValue extends NavigationState {
    setActiveGroupId: (id: string) => void;
    togglePanel: () => void;
    setMobileOpen: (open: boolean) => void;
}
