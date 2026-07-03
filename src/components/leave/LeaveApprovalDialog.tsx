"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface LeaveApprovalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comments: string) => Promise<void>;
  employeeName: string;
}

export function LeaveApprovalDialog({
  isOpen,
  onClose,
  onConfirm,
  employeeName,
}: LeaveApprovalDialogProps) {
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm(comments);
      setComments("");
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Approve Leave Request</DialogTitle>
          <DialogDescription className="text-xs">
            Are you sure you want to approve the leave request for **{employeeName}**?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <label htmlFor="approve-comments" className="text-xs font-semibold text-muted-foreground">
            Manager Comments (Optional)
          </label>
          <Textarea
            id="approve-comments"
            placeholder="Add any comments or instructions..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="text-xs"
            disabled={submitting}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={submitting} className="text-xs">
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleConfirm}
            disabled={submitting}
            className="bg-primary text-primary-foreground text-xs"
          >
            {submitting ? "Approving..." : "Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default LeaveApprovalDialog;
