import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { TimesheetLog } from "@/types/timesheet";
import { useAuth } from "@/hooks/useAuth";
interface Props {
  onSubmit: (data: Omit<TimesheetLog, "id" | "status" | "createdAt" | "updatedAt">) => Promise<void>;
}
export function TimesheetFormDialog({ onSubmit }: Props) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [project, setProject] = useState("");
  const [task, setTask] = useState("");
  const [comments, setComments] = useState("");
  const [date, setDate] = useState("");
  const [hours, setHours] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !task || !date || !hours || !comments) {
      toast.error("Please fill in all timesheet entry fields.");
      return;
    }
    const newHours = parseFloat(hours);
    if (isNaN(newHours) || newHours <= 0 || newHours > 24) {
      toast.error("Please enter a valid amount of hours worked (0 - 24).");
      return;
    }
    if (!user) {
      toast.error("You must be logged in to log time.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({
        uid: user.uid,
        employeeId: user.employeeId || "EMP-N/A",
        employeeName: user.name || "Unknown",
        project,
        task,
        comments,
        date,
        hours: newHours,
      });

      toast.success("Timesheet entry saved as draft!");
      
      // Clear form
      setProject("");
      setTask("");
      setComments("");
      setDate("");
      setHours("");
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to log time.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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

          <div className="flex flex-col gap-1.5">
            <label htmlFor="task" className="text-sm font-semibold text-foreground/90">
              Task Details *
            </label>
            <input
              id="task"
              type="text"
              placeholder="Brief summary of the task..."
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="comments" className="text-sm font-semibold text-foreground/90">
              Daily Work Comments *
            </label>
            <textarea
              id="comments"
              rows={3}
              placeholder="Provide detailed comments about your work..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="flex w-full rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring resize-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="h-9 rounded-xl cursor-pointer"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-9 rounded-xl cursor-pointer bg-primary hover:bg-primary/95 text-primary-foreground font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save as Draft"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
