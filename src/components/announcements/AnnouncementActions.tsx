"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { ConfirmDialog } from "@/components/common";
import type { Announcement } from "@/types/announcement";

interface AnnouncementActionsProps {
  announcement: Announcement;
  onEdit: (announcement: Announcement) => void;
  onDelete: (id: string) => void | Promise<void>;
}

export function AnnouncementActions({
  announcement,
  onEdit,
  onDelete,
}: AnnouncementActionsProps) {
  return (
    <RoleGuard roles={["admin", "hr"]}>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex size-8 items-center justify-center rounded-lg p-0 cursor-pointer hover:bg-muted/80 text-muted-foreground hover:text-foreground focus-visible:outline-hidden">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 border border-border bg-card shadow-md">
          {/* Edit Announcement */}
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onEdit(announcement);
            }}
            className="cursor-pointer"
          >
            <Pencil className="mr-2 size-4 text-muted-foreground" />
            <span>Edit Announcement</span>
          </DropdownMenuItem>

          {/* Delete Announcement — triggers ConfirmDialog */}
          <ConfirmDialog
            variant="destructive"
            title="Delete Announcement"
            description={`Are you sure you want to delete "${announcement.title}"? This action cannot be undone.`}
            confirmLabel="Delete"
            onConfirm={() => onDelete(announcement.id)}
            trigger={
              <div
                role="menuitem"
                tabIndex={0}
                className="flex w-full items-center px-2 py-1.5 text-sm cursor-pointer rounded-sm hover:bg-destructive/10 text-destructive focus:text-destructive transition-colors select-none outline-hidden"
              >
                <Trash2 className="mr-2 size-4 text-destructive" />
                <span>Delete</span>
              </div>
            }
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </RoleGuard>
  );
}
