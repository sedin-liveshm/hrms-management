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
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";

interface LeaveRejectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (rejectionReason: string, comments: string) => Promise<void>;
  employeeName: string;
}

export function LeaveRejectDialog({
  isOpen,
  onClose,
  onConfirm,
  employeeName,
}: LeaveRejectDialogProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (!rejectionReason || rejectionReason.trim() === "") {
      setError("Rejection reason is mandatory.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onConfirm(rejectionReason, comments);
      setRejectionReason("");
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
          <DialogTitle className="text-destructive">Reject Leave Request</DialogTitle>
          <DialogDescription className="text-xs">
            Are you sure you want to reject the leave request for **{employeeName}**?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Rejection Reason (Mandatory) */}
          <div className="space-y-2">
            <label htmlFor="reject-reason" className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              Rejection Reason <span className="text-destructive font-bold">*</span>
            </label>
            <Input
              id="reject-reason"
              type="text"
              placeholder="e.g. Project deliverable deadline / Overlapping team schedule"
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                if (e.target.value.trim() !== "") setError("");
              }}
              className={`text-xs ${error ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
              disabled={submitting}
              required
            />
            {error && (
              <p className="text-[11px] text-destructive flex items-center gap-1 font-medium mt-1">
                <AlertCircle className="size-3" />
                {error}
              </p>
            )}
          </div>

          {/* Comments (Optional) */}
          <div className="space-y-2">
            <label htmlFor="reject-comments" className="text-xs font-semibold text-muted-foreground">
              Additional Comments (Optional)
            </label>
            <Textarea
              id="reject-comments"
              placeholder="Add any further details..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="text-xs"
              disabled={submitting}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={submitting} className="text-xs">
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
            disabled={submitting || !rejectionReason.trim()}
            className="text-xs"
          >
            {submitting ? "Rejecting..." : "Reject Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default LeaveRejectDialog;
