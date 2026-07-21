"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Clock,
  Umbrella,
  Megaphone,
  Plus,
  Calendar,
  Briefcase,
  TrendingUp,
  MapPin,
  ArrowRight,
  UserCheck,
  CheckCircle,
  LogOut,
  FolderLock,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import {
  PageContainer,
  PageHeader,
  StatCard,
  SectionCard,
  EmptyState,
} from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";
import { useAttendance } from "@/hooks/useAttendance";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { user, role } = useAuth();
  const { data, loading: dashLoading, error: dashError } = useDashboard();
  const { todayRecord, checkIn, checkOut, loading: attLoading } = useAttendance();
  const [liveTime, setLiveTime] = useState<Date | null>(null);

  // Tick the live digital clock
  useEffect(() => {
    const timer = setTimeout(() => {
      setLiveTime(new Date());
    }, 0);
    const interval = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const formatLiveTime = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const formatLiveDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  };

  const parseDate = (val: any): Date => {
    if (!val) return new Date();
    if (val instanceof Date) return val;
    if (typeof val === "string") return new Date(val);
    if (typeof val.toDate === "function") return val.toDate();
    if (typeof val.seconds === "number") return new Date(val.seconds * 1000);
    return new Date(val);
  };

  // Determine welcome greeting based on time of day
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return "Good Morning";
    if (hrs < 17) return "Good Afternoon";
    return "Good Evening";
  };

  if (dashLoading && !data) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-9 w-60 rounded-lg" />
            <Skeleton className="h-4 w-96 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Skeleton className="lg:col-span-2 h-96 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      </PageContainer>
    );
  }

  const stats = data?.stats;

  // Determine Stat Cards based on user roles
  const getStatCards = () => {
    if (role === "admin" || role === "hr") {
      return [
        {
          label: "Total Employees",
          value: String(stats?.totalEmployees || 0),
          icon: Users,
          trend: { value: "Registered", direction: "up" as const, label: "in database" },
        },
        {
          label: "Active Employees",
          value: String(stats?.activeEmployees || 0),
          icon: UserCheck,
          iconClassName: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
          trend: { value: "Online", direction: "up" as const, label: "active profiles" },
        },
        {
          label: "Present Today",
          value: String(stats?.presentToday || 0),
          icon: Clock,
          trend: {
            value: `${stats?.lateToday || 0} late`,
            direction: "up" as const,
            label: `· ${stats?.absentToday || 0} absent`,
          },
        },
        {
          label: "Pending Leaves",
          value: String(stats?.pendingLeaves || 0),
          icon: Umbrella,
          iconClassName: "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
          trend: { value: "Action Required", direction: "down" as const, label: "awaiting review" },
        },
      ];
    }

    if (role === "manager") {
      return [
        {
          label: "Team Members",
          value: String(stats?.totalEmployees || 0),
          icon: Users,
          trend: { value: "Active", direction: "up" as const, label: "reporting to you" },
        },
        {
          label: "Team Present Today",
          value: String(stats?.presentToday || 0),
          icon: Clock,
          trend: { value: `${stats?.lateToday || 0} late`, direction: "up" as const, label: "today" },
        },
        {
          label: "Team On Leave Today",
          value: String(stats?.employeesOnLeave || 0),
          icon: Umbrella,
          iconClassName: "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
          trend: { value: "Approved", direction: "down" as const, label: "leaves today" },
        },
        {
          label: "Pending Approvals",
          value: String(stats?.pendingLeaves || 0),
          icon: Umbrella,
          iconClassName: "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
          trend: { value: "Review", direction: "down" as const, label: "team leaves" },
        },
      ];
    }

    // Default Employee stats
    return [
      {
        label: "Present Days (Month)",
        value: String(stats?.presentToday || 0),
        icon: Clock,
        trend: { value: `${stats?.lateToday || 0} late arrivals`, direction: "up" as const, label: "this month" },
      },
      {
        label: "Pending Leaves",
        value: String(stats?.pendingLeaves || 0),
        icon: Umbrella,
        iconClassName: "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
        trend: { value: "Awaiting", direction: "down" as const, label: "HR approval" },
      },
      {
        label: "Approved Leaves",
        value: String(stats?.employeesOnLeave || 0),
        icon: CheckCircle,
        iconClassName: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
        trend: { value: "Taken", direction: "up" as const, label: "this year" },
      },
      {
        label: "Weekly Logged Hours",
        value: "38.5 hrs",
        icon: Clock,
        trend: { value: "Avg 7.7 hrs/day", direction: "up" as const, label: "this week" },
      },
    ];
  };

  const handleCheckIn = async () => {
    try {
      await checkIn();
    } catch {
      // Errors handled in hook toast
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOut();
    } catch {
      // Errors handled in hook toast
    }
  };

  return (
    <PageContainer>
      {/* ── Welcome Header ─────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs relative overflow-hidden">
        {/* Dynamic Abstract Banner Background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-15 dark:opacity-5"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(circle at 80% 20%, var(--primary) 0%, transparent 50%), radial-gradient(circle at 10% 80%, var(--accent) 0%, transparent 40%)",
          }}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {getGreeting()}, {user?.name || user?.displayName || "Employee"} 👋
            </h1>
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 flex-wrap">
              <Briefcase className="size-4 shrink-0 text-primary" />
              <span>{user?.designation || "Staff Member"}</span>
              <span className="text-border">•</span>
              <span>{user?.department || "General Department"}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0 flex gap-1.5 py-1 px-3 rounded-lg font-semibold text-xs transition-all">
              <TrendingUp className="size-3.5" />
              All Systems Operational
            </Badge>
          </div>
        </div>
      </div>

      {/* ── KPI Stats Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {getStatCards().map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            iconClassName={stat.iconClassName}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* ── Content Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Column — 2/3 Width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Check-In/Check-Out Quick Action Widget */}
          <SectionCard
            title="Shift Check-In"
            description="Log your daily attendance work hours"
            action={
              <div className="text-right">
                <span className="text-sm font-bold text-foreground tracking-tight tabular-nums block">
                  {formatLiveTime(liveTime)}
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold block">
                  {formatLiveDate(liveTime)}
                </span>
              </div>
            }
          >
            <div className="rounded-xl border border-border bg-muted/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Today's Status
                </p>
                {todayRecord ? (
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-foreground flex items-center justify-center sm:justify-start gap-1.5">
                      <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                      Checked In at {new Date(todayRecord.checkIn!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {todayRecord.checkOut ? (
                      <p className="text-xs text-muted-foreground font-medium">
                        Checked Out at {new Date(todayRecord.checkOut!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ({todayRecord.totalHours} hrs worked)
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground font-medium">
                        Active shift in progress...
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5">
                    <span className="size-2 rounded-full bg-amber-400" />
                    Not checked in yet.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-center">
                {!todayRecord ? (
                  <Button
                    onClick={handleCheckIn}
                    disabled={attLoading}
                    className="w-full sm:w-auto h-10 rounded-xl px-5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <UserCheck className="size-4" />
                    Check In
                  </Button>
                ) : !todayRecord.checkOut ? (
                  <Button
                    onClick={handleCheckOut}
                    disabled={attLoading}
                    variant="destructive"
                    className="w-full sm:w-auto h-10 rounded-xl px-5 font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <LogOut className="size-4" />
                    Check Out
                  </Button>
                ) : (
                  <Button
                    disabled
                    className="w-full sm:w-auto h-10 rounded-xl px-5 bg-muted text-muted-foreground font-bold flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="size-4" />
                    Shift Completed
                  </Button>
                )}
              </div>
            </div>
          </SectionCard>

          {/* Role-Based Panel (Recent Employees or Personal Leave summary) */}
          {(role === "admin" || role === "hr") && data?.recentEmployees && data.recentEmployees.length > 0 ? (
            <SectionCard
              title="Recent Additions"
              description="Newly joined team members"
              action={
                <Link
                  href="/employees"
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
                >
                  View all
                  <ArrowRight className="size-3" />
                </Link>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.recentEmployees.map((emp) => {
                  const initials = emp.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "E";

                  return (
                    <div
                      key={emp.employeeId}
                      className="flex items-center gap-3 rounded-xl border border-border/60 p-3 bg-card hover:bg-muted/30 transition-colors"
                    >
                      <Avatar className="size-10 border border-border">
                        <AvatarImage src={emp.photoURL || undefined} alt={emp.name} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{emp.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{emp.designation}</p>
                      </div>
                      <Badge className="bg-neutral-100 text-neutral-600 border-0 text-[10px]">
                        {emp.department}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          ) : (
            role === "employee" && (
              <SectionCard
                title="My Personal Leave"
                description="Status of your applied leave requests"
                action={
                  <Link
                    href="/leave"
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
                  >
                    Apply Leave
                    <Plus className="size-3" />
                  </Link>
                }
              >
                {data?.leaveRequests && data.leaveRequests.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {data.leaveRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border border-border bg-card"
                      >
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-foreground">{req.leaveType}</p>
                          <p className="text-xs text-muted-foreground">
                            {parseDate(req.startDate).toLocaleDateString([], { month: "short", day: "numeric" })} - {parseDate(req.endDate).toLocaleDateString([], { month: "short", day: "numeric" })} ({req.totalDays} day{req.totalDays > 1 ? "s" : ""})
                          </p>
                        </div>
                        <Badge
                          className={cn(
                            "w-fit border-0 text-[10px] font-bold px-2 py-0.5 rounded-md",
                            req.status === "approved" ? "bg-emerald-50 text-emerald-600" :
                            req.status === "rejected" ? "bg-destructive/10 text-destructive" :
                            "bg-amber-50 text-amber-600"
                          )}
                        >
                          {req.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No Leave Requests"
                    description="You haven't submitted any leave requests yet."
                  />
                )}
              </SectionCard>
            )
          )}

          {/* Announcements Widget */}
          <SectionCard
            title="Latest Announcements"
            description="Company updates and notices"
            action={
              <Link
                href="/announcements"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
              >
                View all
                <ArrowRight className="size-3" />
              </Link>
            }
          >
            {data?.announcements && data.announcements.length > 0 ? (
              <div className="divide-y divide-border">
                {data.announcements.map((ann) => (
                  <div key={ann.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
                    <div className="mt-1 size-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Megaphone className="size-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground truncate">{ann.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                        {ann.content}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground font-semibold">
                        <span>By {ann.createdBy || "Management"}</span>
                        <span>•</span>
                        <span>{parseDate(ann.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Announcements"
                description="Everything is quiet for now. Announcements will appear here."
              />
            )}
          </SectionCard>
        </div>

        {/* Sidebar Column — 1/3 Width */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <SectionCard title="Quick Actions" description="Fast links to common workflows">
            <div className="grid grid-cols-1 gap-2.5">
              <Link href="/profile">
                <Button variant="outline" className="w-full justify-start h-10 rounded-xl border-border bg-card text-foreground hover:bg-muted/50 cursor-pointer font-semibold gap-2.5">
                  <Avatar className="size-5 shrink-0">
                    <AvatarFallback className="bg-primary/20 text-[9px] text-primary">
                      ME
                    </AvatarFallback>
                  </Avatar>
                  View Profile
                </Button>
              </Link>

              <Link href="/leave">
                <Button variant="outline" className="w-full justify-start h-10 rounded-xl border-border bg-card text-foreground hover:bg-muted/50 cursor-pointer font-semibold gap-2.5">
                  <Umbrella className="size-4 text-amber-500 shrink-0" />
                  Apply Leave
                </Button>
              </Link>

              <Link href="/attendance">
                <Button variant="outline" className="w-full justify-start h-10 rounded-xl border-border bg-card text-foreground hover:bg-muted/50 cursor-pointer font-semibold gap-2.5">
                  <Clock className="size-4 text-emerald-500 shrink-0" />
                  View Attendance History
                </Button>
              </Link>

              <Link href="/timesheet">
                <Button variant="outline" className="w-full justify-start h-10 rounded-xl border-border bg-card text-foreground hover:bg-muted/50 cursor-pointer font-semibold gap-2.5">
                  <Clock className="size-4 text-indigo-500 shrink-0" />
                  Log Timesheet Hours
                </Button>
              </Link>

              {/* Admin/HR Specific Actions */}
              {(role === "admin" || role === "hr") && (
                <>
                  <Link href="/employees">
                    <Button variant="outline" className="w-full justify-start h-10 rounded-xl border-border bg-card text-foreground hover:bg-muted/50 cursor-pointer font-semibold gap-2.5">
                      <Users className="size-4 text-blue-500 shrink-0" />
                      Add Employee
                    </Button>
                  </Link>

                  <Link href="/announcements">
                    <Button variant="outline" className="w-full justify-start h-10 rounded-xl border-border bg-card text-foreground hover:bg-muted/50 cursor-pointer font-semibold gap-2.5">
                      <Megaphone className="size-4 text-purple-500 shrink-0" />
                      Post Announcement
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </SectionCard>

          {/* Pending Leaves List (Admins / Managers only) */}
          {(role === "admin" || role === "hr" || role === "manager") && (
            <SectionCard
              title="Pending Approvals"
              description="Leave requests awaiting your decision"
              action={
                <Link
                  href="/team/leave-approval"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Review
                </Link>
              }
            >
              {data?.leaveRequests && data.leaveRequests.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {data.leaveRequests.map((req) => (
                    <div
                      key={req.id}
                      className="flex flex-col gap-1.5 rounded-xl border border-border/80 bg-muted/20 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">
                          {req.employeeName || "Team Member"}
                        </p>
                        <Badge className="bg-amber-50 text-amber-600 border-0 text-[9px] font-bold">
                          Pending
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-semibold">
                        {req.leaveType} · {req.totalDays} day{req.totalDays > 1 ? "s" : ""}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {parseDate(req.startDate).toLocaleDateString([], { month: "short", day: "numeric" })} - {parseDate(req.endDate).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No Pending Approvals"
                  description="All team leave requests are processed."
                />
              )}
            </SectionCard>
          )}

          {/* Today's Holidays / Celebrations Card (Mock details) */}
          <SectionCard title="Upcoming Holidays" description="Mark your calendar">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 bg-muted/20 rounded-xl">
                <div className="size-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                  AUG 15
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">Independence Day</p>
                  <p className="text-xs text-muted-foreground">National Holiday</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 bg-muted/20 rounded-xl">
                <div className="size-9 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                  SEP 05
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">Ganesh Chaturthi</p>
                  <p className="text-xs text-muted-foreground">Regional Festival</p>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </PageContainer>
  );
}
