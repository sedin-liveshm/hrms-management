
import type { Metadata } from "next";
import {
  Users,
  Clock,
  Umbrella,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  StatCard,
  SectionCard,
  EmptyState,
} from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const metadata: Metadata = {
  title: "Dashboard",
};

// ─── Mock Data
const stats = [
  {
    label: "Total Employees",
    value: "248",
    icon: Users,
    trend: { value: "+12", direction: "up" as const, label: "this month" },
  },
  {
    label: "Present Today",
    value: "213",
    icon: Clock,
    trend: { value: "86%", direction: "up" as const, label: "attendance" },
  },
  {
    label: "On Leave",
    value: "18",
    icon: Umbrella,
    trend: { value: "-3", direction: "down" as const, label: "vs last week" },
  },
  {
    label: "Payroll Due",
    value: "₹12.4L",
    icon: DollarSign,
    trend: { value: "+2.1%", direction: "up" as const, label: "vs last month" },
  },
];

const recentEmployees = [
  { id: "1", name: "Ananya Krishnan", role: "Software Engineer", status: "Active" },
  { id: "2", name: "Rahul Sharma", role: "Product Manager", status: "Active" },
  { id: "3", name: "Priya Nair", role: "UI Designer", status: "On Leave" },
  { id: "4", name: "Karthik Raja", role: "DevOps Engineer", status: "Active" },
];

const leaveRequests = [
  { id: "1", name: "Sneha Patel", type: "Sick Leave", days: 2, status: "Pending" },
  { id: "2", name: "Arun Kumar", type: "Annual Leave", days: 5, status: "Pending" },
];

export default function DashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening today."
        action={
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
            <TrendingUp className="mr-1.5 size-3" />
            All systems operational
          </Badge>
        }
      />

      {/* ── KPI Stats Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* ── Content Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Employees — 2/3 width on large screens */}
        <div className="lg:col-span-2">
          <SectionCard
            title="Recent Employees"
            description="Latest additions to the team"
            action={
              <a
                href="/employees"
                className="text-xs font-medium text-primary hover:underline"
              >
                View all
              </a>
            }
          >
            <div className="flex flex-col gap-3">
              {recentEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/50"
                >
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-secondary/10 text-xs font-semibold text-secondary">
                      {emp.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {emp.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{emp.role}</p>
                  </div>
                  <Badge
                    variant={emp.status === "Active" ? "default" : "secondary"}
                    className={
                      emp.status === "Active"
                        ? "bg-primary/10 text-primary hover:bg-primary/20 border-0"
                        : "bg-secondary/10 text-secondary hover:bg-secondary/20 border-0"
                    }
                  >
                    {emp.status}
                  </Badge>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Leave Requests — 1/3 width */}
        <SectionCard
          title="Pending Leave"
          description="Requests awaiting approval"
          action={
            <Badge className="bg-destructive/10 text-destructive border-0 text-xs">
              {leaveRequests.length} pending
            </Badge>
          }
        >
          {leaveRequests.length > 0 ? (
            <div className="flex flex-col gap-3">
              {leaveRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex flex-col gap-1.5 rounded-xl border border-border bg-muted/30 p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {req.name}
                    </p>
                    <Badge className="bg-amber-50 text-amber-600 border-0 text-[10px]">
                      {req.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {req.type} · {req.days} day{req.days > 1 ? "s" : ""}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No pending requests"
              description="All leave requests have been processed."
            />
          )}
        </SectionCard>
      </div>
    </PageContainer>
  );
}
