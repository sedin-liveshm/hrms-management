import React, { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (project: string, task: string) => void;
}

export function AddTimesheetRowDialog({ isOpen, onClose, onAdd }: Props) {
  const [project, setProject] = useState("");
  const [task, setTask] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !task) {
      toast.error("Please fill in both Project and Task.");
      return;
    }
    onAdd(project, task);
    setProject("");
    setTask("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-2xl border border-border bg-card shadow-lg">
        <DialogHeader className="pb-3 border-b border-border">
          <DialogTitle className="text-xl font-bold">Add Project Row</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold">Project Name *</label>
            <input
              type="text"
              placeholder="e.g. HRMS Integration"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              autoFocus
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold">Task Details *</label>
            <input
              type="text"
              placeholder="Brief summary of the task..."
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button type="button" variant="outline" onClick={onClose} className="h-9 rounded-xl">
              Cancel
            </Button>
            <Button type="submit" className="h-9 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground">
              Add Row
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
