"use client";

import React, { useState } from "react";
import {
  Timer,
  Plus,
  Briefcase,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  StatCard,
  DataTable,
  type Column,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TimesheetEntry {
  id: string;
  date: string;
  project: string;
  task: string;
  hours: number;
  status: "approved" | "pending" | "draft" | "rejected";
}

export default function TimesheetPage() {
  const [entries, setEntries] = useState<TimesheetEntry[]>([
    {
      id: "1",
      date: "2026-07-09",
      project: "HRMS Integration",
      task: "Designed organization chart component and department grids",
      hours: 8,
      status: "pending",
    },
    {
      id: "2",
      date: "2026-07-08",
      project: "HRMS Integration",
      task: "Developed timesheet logs screen and dynamic dashboard service layer",
      hours: 8,
      status: "approved",
    },
    {
      id: "3",
      date: "2026-07-07",
      project: "HRMS Integration",
      task: "Refactored user.service.ts and auth.service.ts for account activation",
      hours: 8.5,
      status: "approved",
    },
    {
      id: "4",
      date: "2026-07-06",
      project: "Client Portal",
      task: "Conducted sprint review and refined dashboard design criteria",
      hours: 6,
      status: "approved",
    },
    {
      id: "5",
      date: "2026-07-03",
      project: "Internal CRM",
      task: "Resolved dropdown click event conflict in announcements delete button",
      hours: 8,
      status: "approved",
    },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [project, setProject] = useState("");
  const [task, setTask] = useState("");
  const [date, setDate] = useState("");
  const [hours, setHours] = useState("");

  // Summary Metrics calculations
  const totalHours = entries.reduce((acc, curr) => acc + curr.hours, 0);
  const billableHours = entries
    .filter((e) => e.project !== "Internal CRM")
    .reduce((acc, curr) => acc + curr.hours, 0);
  const pendingHours = entries
    .filter((e) => e.status === "pending")
    .reduce((acc, curr) => acc + curr.hours, 0);
  const uniqueProjects = Array.from(new Set(entries.map((e) => e.project))).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !task || !date || !hours) {
      toast.error("Please fill in all timesheet entry fields.");
      return;
    }

    const newHours = parseFloat(hours);
    if (isNaN(newHours) || newHours <= 0 || newHours > 24) {
      toast.error("Please enter a valid amount of hours worked (0 - 24).");
      return;
    }

    const newEntry: TimesheetEntry = {
      id: String(Date.now()),
      date,
      project,
      task,
      hours: newHours,
      status: "pending",
    };

    setEntries((prev) => [newEntry, ...prev]);
    toast.success("Timesheet entry logged successfully!");

    // Clear form
    setProject("");
    setTask("");
    setDate("");
    setHours("");
    setIsOpen(false);
  };

  const columns: Column<TimesheetEntry>[] = [
    {
      key: "date",
      label: "Date",
      width: "120px",
      renderCell: (row) => (
        <span className="font-semibold text-xs text-foreground/80">
          {new Date(row.date).toLocaleDateString([], {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "project",
      label: "Project Name",
      width: "180px",
      renderCell: (row) => (
        <span className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Briefcase className="size-3.5 text-primary shrink-0" />
          {row.project}
        </span>
      ),
    },
    {
      key: "task",
      label: "Task Details & Description",
      renderCell: (row) => (
        <p className="text-sm text-muted-foreground line-clamp-1 leading-relaxed max-w-lg">
          {row.task}
        </p>
      ),
    },
    {
      key: "hours",
      label: "Hours Worked",
      width: "120px",
      align: "center",
      renderCell: (row) => (
        <span className="font-mono font-bold text-sm text-foreground/90">
          {row.hours} hrs
        </span>
      ),
    },
    {
      key: "status",
      label: "Approval Status",
      width: "120px",
      renderCell: (row) => (
        <Badge
          className={cn(
            "border-0 text-[10px] font-bold px-2 py-0.5 rounded-md",
            row.status === "approved"
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              : row.status === "rejected"
              ? "bg-destructive/10 text-destructive"
              : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
          )}
        >
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Timesheet Logs"
        subtitle="Record billable hours and track work hours across projects"
        action={
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger
              render={
                <Button size="sm" className="gap-1.5 rounded-xl cursor-pointer">
                  <Plus className="size-4" />
                  Log Time
                </Button>
              }
            />
            <DialogContent className="max-w-md rounded-2xl border border-border bg-card text-card-foreground shadow-lg focus-visible:outline-hidden">
              <DialogHeader className="pb-3 border-b border-border">
                <DialogTitle className="text-xl font-bold text-foreground">
                  Add New Time Entry
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 pt-3">
                {/* Project Selection */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="project" className="text-sm font-semibold text-foreground/90">
                    Project Name *
                  </label>
                  <input
                    id="project"
                    type="text"
                    placeholder="e.g. HRMS Integration"
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                    required
                  />
                </div>

                {/* Date Input */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="date" className="text-sm font-semibold text-foreground/90">
                    Date *
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                    required
                  />
                </div>

                {/* Hours Worked */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="hours" className="text-sm font-semibold text-foreground/90">
                    Hours Logged *
                  </label>
                  <input
                    id="hours"
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    placeholder="e.g. 8"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                    required
                  />
                </div>

                {/* Task Details */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="task" className="text-sm font-semibold text-foreground/90">
                    Task Description *
                  </label>
                  <textarea
                    id="task"
                    rows={3}
                    placeholder="Provide a detailed description of what you did..."
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    className="flex w-full rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring resize-none"
                    required
                  />
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="h-9 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="h-9 rounded-xl cursor-pointer bg-primary hover:bg-primary/95 text-primary-foreground font-semibold"
                  >
                    Submit Entry
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* ── Timesheet Summary Cards ────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="This Week Hours"
          value={`${totalHours} hrs`}
          icon={Clock}
          trend={{ value: "Target: 40 hrs", direction: "up", label: "logged" }}
        />
        <StatCard
          label="Billable Hours"
          value={`${billableHours} hrs`}
          icon={Timer}
          iconClassName="bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
          trend={{ value: `${Math.round((billableHours / totalHours) * 100) || 0}%`, direction: "up", label: "utilization" }}
        />
        <StatCard
          label="Pending Approval"
          value={`${pendingHours} hrs`}
          icon={AlertCircle}
          iconClassName="bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
          trend={{ value: "Awaiting review", direction: "down", label: "by manager" }}
        />
        <StatCard
          label="Projects Worked"
          value={String(uniqueProjects)}
          icon={Briefcase}
          iconClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
          trend={{ value: "Active allocations", direction: "up", label: "on files" }}
        />
      </div>

      {/* ── Timesheet Logs Table ───────────────────────────── */}
      <div className="mt-4">
        <DataTable
          columns={columns}
          data={entries}
          rowKey="id"
          isLoading={false}
          skeletonRows={5}
          emptyTitle="No Timesheet Logs Found"
          emptyDescription="You haven't logged any time entry for this week yet."
        />
      </div>
    </PageContainer>
  );
}
