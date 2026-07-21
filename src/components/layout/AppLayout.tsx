
"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Navbar } from "./Navbar";
import { NavigationProvider } from "@/providers/NavigationProvider";
import { useAuth } from "@/hooks/useAuth";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { role } = useAuth();

  return (
    <NavigationProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full">
          <AppSidebar role={role || "employee"} />
          <SidebarInset className="flex flex-1 flex-col overflow-hidden bg-background">
            <Navbar />
            <div className="flex-1 overflow-y-auto">{children}</div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </NavigationProvider>
  );
}
