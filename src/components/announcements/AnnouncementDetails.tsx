"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Announcement } from "@/types/announcement";
import { announcementService } from "@/services/announcement.service";

interface AnnouncementDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: Announcement | null;
}

export function AnnouncementDetails({
  isOpen,
  onClose,
  announcement,
}: AnnouncementDetailsProps) {
  if (!announcement) return null;

  const date = announcementService.toDate(announcement.createdAt);
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  const initials = announcement.createdByName
    ? announcement.createdByName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "HR";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl rounded-2xl border border-border bg-card text-card-foreground shadow-lg focus-visible:outline-hidden">
        <DialogHeader className="pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 border border-border">
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-left">
              <span className="text-sm font-semibold text-foreground">
                {announcement.createdByName}
              </span>
              <span className="text-xs text-muted-foreground">
                Posted on {formattedDate}
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 overflow-y-auto max-h-[60vh] space-y-4">
          <DialogTitle className="text-xl font-bold text-foreground">
            {announcement.title}
          </DialogTitle>
          <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
            {announcement.content}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
