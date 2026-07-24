"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { 
  Wallet, 
  FileText, 
  Landmark, 
  FileBadge2, 
  Calculator,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const employeeLinks = [
  { name: "My Salary", href: "/payroll/my-salary", icon: Wallet },
  { name: "Payslips", href: "/payroll/payslips", icon: FileText },
  { name: "Bank Details", href: "/payroll/bank-details", icon: Landmark },
];

const adminLinks = [
  { name: "Salary Structures", href: "/payroll/admin/structures", icon: Users },
  { name: "Bank Requests", href: "/payroll/admin/requests", icon: FileBadge2 },
  { name: "Generate Payslips", href: "/payroll/admin/generate", icon: Calculator },
];

export default function PayrollLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const isAdminOrHr = role === "admin" || role === "hr";

  return (
    <div className="flex flex-col md:flex-row h-full gap-6">
      {/* Sidebar Navigation */}
      <aside
        className={cn(
          "w-full shrink-0 space-y-6 transition-[width] duration-200 md:w-64",
          isSidebarCollapsed && "md:w-16"
        )}
      >
        <div>
          <div className={cn("mb-2 flex items-center", isSidebarCollapsed ? "justify-center" : "justify-between px-4")}>
            {!isSidebarCollapsed && (
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                My Payroll
              </h3>
            )}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={isSidebarCollapsed ? "Expand payroll navigation" : "Collapse payroll navigation"}
              title={isSidebarCollapsed ? "Expand navigation" : "Collapse navigation"}
            >
              {isSidebarCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            </button>
          </div>
          <nav className="flex flex-col gap-1">
            {employeeLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "flex items-center rounded-lg py-2.5 text-sm font-semibold transition-colors",
                    isSidebarCollapsed ? "justify-center px-2" : "gap-3 px-4",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground hover:bg-muted hover:text-foreground"
                  )}
                  title={isSidebarCollapsed ? link.name : undefined}
                >
                  <link.icon className={cn("size-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                  <span className={isSidebarCollapsed ? "sr-only" : undefined}>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {isAdminOrHr && (
          <div>
            {!isSidebarCollapsed && (
              <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Admin & HR
              </h3>
            )}
            <nav className="flex flex-col gap-1">
              {adminLinks.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "flex items-center rounded-lg py-2.5 text-sm font-semibold transition-colors",
                      isSidebarCollapsed ? "justify-center px-2" : "gap-3 px-4",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground hover:bg-muted hover:text-foreground"
                    )}
                    title={isSidebarCollapsed ? link.name : undefined}
                  >
                    <link.icon className={cn("size-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                    <span className={isSidebarCollapsed ? "sr-only" : undefined}>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 bg-card rounded-xl border border-border p-6 shadow-xs">
        {children}
      </div>
    </div>
  );
}
