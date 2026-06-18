/**
 * Dashboard Group Layout — src/app/(dashboard)/layout.tsx
 *
 * WHY THIS EXISTS:
 * All dashboard routes share the same shell: sidebar + navbar + content area.
 * This layout wraps every route inside (dashboard)/ automatically via
 * Next.js App Router nested layouts.
 *
 * WHY Server Component:
 * The layout itself needs no client state. Client boundaries are declared
 * inside AppLayout's children (AppSidebar, Navbar).
 *
 * Next.js App Router behavior:
 * - This layout is mounted ONCE per session
 * - Navigating between /dashboard, /employees, /leave, etc. does NOT
 *   remount this layout — only the page slot rerenders
 * - This is what gives the sidebar its "sticky" feel
 *
 * PROTECTED:
 * ProtectedLayout wraps children — Firebase auth plugs in there on Day 4.
 */

import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Dashboard | HRMS",
    template: "%s | HRMS",
  },
};

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayout>
      <AppLayout role="admin">
        {children}
      </AppLayout>
    </ProtectedLayout>
  );
}
