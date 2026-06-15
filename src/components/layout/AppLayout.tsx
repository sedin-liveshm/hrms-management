
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Navbar } from "./Navbar";
import { NavigationProvider } from "@/providers/NavigationProvider";
import type { UserRole } from "@/types/navigation";

interface AppLayoutProps {
    children: React.ReactNode;
    role?: UserRole;
}

export function AppLayout({ children, role = "admin" }: AppLayoutProps) {
    return (
        <NavigationProvider>
            <SidebarProvider defaultOpen={true}>
                <div className="flex min-h-screen w-full">
                    <AppSidebar role={role} />
                    <SidebarInset className="flex flex-1 flex-col overflow-hidden bg-background">
                        <Navbar />
                        <div className="flex-1 overflow-y-auto">{children}</div>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </NavigationProvider>
    );
}