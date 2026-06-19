
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "HRMS — Human Resource Management System",
    template: "%s | HRMS",
  },
  description:
    "A modern, enterprise-grade Human Resource Management System for managing employees, attendance, leave, payroll and more.",
  keywords: ["HRMS", "HR Management", "Employee Management", "Payroll"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          <TooltipProvider delay={300}>
            {children}
            {/* Sonner toast provider — accessible, animated toast notifications */}
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

