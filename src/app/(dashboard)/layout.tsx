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
      <AppLayout>
        {children}
      </AppLayout>
    </ProtectedLayout>
  );
}
