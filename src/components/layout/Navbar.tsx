"use client";

import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronRight, LogOut, Settings, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

function Breadcrumb({ pathname }: { pathname: string }) {
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .map((seg) =>
      // Convert kebab-case to Title Case
      seg
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-sm">
        {segments.map((seg, idx) => (
          <li key={idx} className="flex items-center gap-1.5">
            {idx > 0 && (
              <ChevronRight
                className="size-3.5 text-muted-foreground"
                aria-hidden="true"
              />
            )}
            <span
              className={cn(
                idx === segments.length - 1
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {seg}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ─── Notification Bell ────────────────────────────────────────────────────────
function NotificationBell({ count = 0 }: { count?: number }) {
  return (
    <button
      aria-label={`Notifications${count > 0 ? `, ${count} unread` : ""}`}
      className="relative flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Bell className="size-4.5" aria-hidden="true" />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}

// ─── User Menu ────────────────────────────────────────────────────────────────
function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const displayName = user.displayName || user.email || "Employee";
  const email = user.email || "";
  
  // Format role for display
  const roleDisplay = user.role.charAt(0).toUpperCase() + user.role.slice(1);

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success("Successfully logged out.");
      router.push("/login");
    } catch (error: any) {
      toast.error(error?.message || "Failed to log out. Please try again.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2.5 rounded-xl p-1.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring select-none cursor-pointer"
        aria-label="User menu"
      >
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="hidden flex-col text-left md:flex">
          <span className="text-xs font-semibold text-foreground">
            {displayName}
          </span>
          <span className="text-[10px] text-muted-foreground">{roleDisplay}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="font-semibold">{displayName}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {email}
              </span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 size-4" aria-hidden="true" />
            My Profile
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 size-4" aria-hidden="true" />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive cursor-pointer"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 size-4" aria-hidden="true" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-sm md:px-6">
      {/* Sidebar toggle — provided by shadcn SidebarTrigger */}
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <Separator orientation="vertical" className="h-5" />

      {/* Breadcrumb */}
      <div className="flex-1">
        <Breadcrumb pathname={pathname} />
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-1">
        <NotificationBell count={3} />
        <Separator orientation="vertical" className="mx-1 h-5" />
        <UserMenu />
      </div>
    </header>
  );
}
