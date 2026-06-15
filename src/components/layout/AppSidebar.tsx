"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    navigationConfig,
    getFilteredNavigation,
    getNavigationGroup,
} from "@/config/navigation";
import { useNavigation } from "@/providers/NavigationProvider";
import type { NavigationGroup, NavigationItem, UserRole } from "@/types/navigation";
import { Building2, ChevronLeft, Badge } from "lucide-react";
import { cn } from "@/lib/utils";

//logo
function SidebarLogo({ collapsed }: { collapsed: boolean }) {
    return (
        <div className="flex items-center gap-3 px-2 py-1">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                <Building2 className="size-4 text-primary-foreground" aria-hidden="true" />
            </div>
            {!collapsed && (
                <div className="flex flex-col leading-tight">
                    <span className="text-sm font-bold text-sidebar-foreground">HRMS</span>
                    <span className="text-[10px] text-sidebar-foreground/60">
                        Management Platform
                    </span>
                </div>
            )}
        </div>
    );
}

//icon 
interface IconRailItemProps {
    group: NavigationGroup;
    isActive: boolean;
    onClick: () => void;
    showTooltip: boolean;
}

function IconRailItem({
    group,
    isActive,
    onClick,
    showTooltip,
}: IconRailItemProps) {
    const Icon = group.icon;

    const button = (
        <button
            type="button"
            onClick={onClick}
            aria-label={group.label}
            aria-pressed={isActive}
            className={cn(
                "flex size-10 items-center justify-center rounded-xl transition-all duration-200 ease-in-out",
                isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}
        >
            <Icon className="size-5" aria-hidden="true" />
        </button>
    );

    if (showTooltip) {
        return (
            <Tooltip>
                <TooltipTrigger>
                    <div
                        role="button"
                        tabIndex={0}
                        onClick={onClick}
                        aria-label={group.label}
                        aria-pressed={isActive}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                onClick();
                            }
                        }}
                        className={cn(
                            "flex size-10 items-center justify-center rounded-xl transition-all duration-200 ease-in-out",
                            isActive
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        )}
                    >
                        <Icon className="size-5" aria-hidden="true" />
                    </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                    {group.label}
                </TooltipContent>
            </Tooltip>
        );
    }

    return button;
}

// Navigation panel
interface NavItemProps {
    item: NavigationItem;
    isActive: boolean;
}

function NavItem({ item, isActive }: NavItemProps) {
    const Icon = item.icon;

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                isActive={isActive}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                    "group/item h-9 rounded-xl px-3 transition-all duration-200 ease-in-out",
                    isActive
                        ? "bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
                render={<Link href={item.href} />}
            >
                <Icon
                    className={cn(
                        "size-4 shrink-0",
                        isActive
                            ? "text-primary-foreground"
                            : "text-sidebar-foreground/60 group-hover/item:text-sidebar-foreground"
                    )}
                    aria-hidden="true"
                />
                <span className="flex-1 text-sm">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                    <Badge
                        className={cn(
                            "ml-auto h-5 min-w-5 px-1.5 text-[10px]",
                            isActive
                                ? "bg-primary-foreground/20 text-primary-foreground"
                                : "bg-primary/10 text-primary"
                        )}
                    >
                        {item.badge > 99 ? "99+" : item.badge}
                    </Badge>
                )}
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

//inner sidebar 
interface InnerSidebarProps {
    role: UserRole;
}

function InnerSidebar({ role }: InnerSidebarProps) {
    const pathname = usePathname();
    const { activeGroupId, setActiveGroupId } = useNavigation();
    const { state, toggleSidebar } = useSidebar();

    const isCollapsed = state === "collapsed";
    const filteredConfig = getFilteredNavigation(navigationConfig, role);
    const activeGroup = getNavigationGroup(filteredConfig, activeGroupId);

    return (
        <Sidebar
            collapsible="icon"
            className="border-r-0"
        >
            {/* Header: Logo */}
            <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
                <SidebarLogo collapsed={isCollapsed} />
            </SidebarHeader>

            {/* Content*/}
            <SidebarContent className="flex flex-row gap-0 p-0">
                {/* Icon Rail (always visible)*/}
                <div className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-sidebar-border py-3">
                    {filteredConfig.map((group) => (
                        <IconRailItem
                            key={group.id}
                            group={group}
                            isActive={activeGroupId === group.id}
                            onClick={() => setActiveGroupId(group.id)}
                            showTooltip={isCollapsed}
                        />
                    ))}
                </div>

                {/* Navigation Panel */}
                {!isCollapsed && activeGroup && (
                    <div className="flex flex-1 flex-col overflow-y-auto">
                        <SidebarGroup className="px-3 py-3">
                            <SidebarGroupLabel className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
                                {activeGroup.label}
                            </SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu className="gap-0.5">
                                    {activeGroup.items.map((item) => {
                                        const isActive =
                                            pathname === item.href ||
                                            (item.href !== "/" && pathname.startsWith(item.href));
                                        return (
                                            <NavItem key={item.id} item={item} isActive={isActive} />
                                        );
                                    })}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </div>
                )}
            </SidebarContent>

            {/* Footer: Collapse toggle */}
            <SidebarFooter className="border-t border-sidebar-border p-3">
                <Tooltip>
                    <TooltipTrigger>
                        <button
                            onClick={toggleSidebar}
                            className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            <ChevronLeft
                                className={cn(
                                    "size-4 transition-transform duration-300",
                                    isCollapsed && "rotate-180"
                                )}
                                aria-hidden="true"
                            />
                            {!isCollapsed && <span>Collapse</span>}
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    </TooltipContent>
                </Tooltip>
            </SidebarFooter>

            {/* Drag handle */}
            <SidebarRail />
        </Sidebar>
    );
}
interface AppSidebarProps {
    role?: UserRole;
}

export function AppSidebar({ role = "employee" }: AppSidebarProps) {
    return <InnerSidebar role={role} />;
}

