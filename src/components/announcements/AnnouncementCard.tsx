"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AnnouncementActions } from "./AnnouncementActions";
import type { Announcement } from "@/types/announcement";
import { announcementService } from "@/services/announcement.service";

interface AnnouncementCardProps {
  announcement: Announcement;
  onView: (announcement: Announcement) => void;
  onEdit: (announcement: Announcement) => void;
  onDelete: (id: string) => void | Promise<void>;
}

export function AnnouncementCard({
  announcement,
  onView,
  onEdit,
  onDelete,
}: AnnouncementCardProps) {
  const date = announcementService.toDate(announcement.createdAt);
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
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
    <Card
      onClick={() => onView(announcement)}
      className="relative group rounded-2xl border border-border bg-card text-card-foreground shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer overflow-hidden"
    >
      <CardHeader className="flex flex-row items-start justify-between pb-2 gap-4">
        <div className="space-y-1 flex-1">
          <CardTitle className="text-base font-semibold tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {announcement.title}
          </CardTitle>
        </div>

        {/* Action Dropdown Menu (HR/Admin only) */}
        <div onClick={(e) => e.stopPropagation()}>
          <AnnouncementActions
            announcement={announcement}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {announcement.content}
        </p>

        <div className="flex items-center gap-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
          <Avatar className="size-5 border border-border">
            <AvatarFallback className="bg-secondary/10 text-[8px] font-medium text-secondary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground/80">{announcement.createdByName}</span>
          <span>·</span>
          <span>{formattedDate}</span>
        </div>
      </CardContent>
    </Card>
  );
}
