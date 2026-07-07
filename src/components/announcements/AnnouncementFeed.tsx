"use client";

import { useState } from "react";
import { Megaphone, Plus, RefreshCw } from "lucide-react";
import {
  PageHeader,
  EmptyState,
  ErrorState,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { AnnouncementCard } from "./AnnouncementCard";
import { AnnouncementDialog } from "./AnnouncementDialog";
import { AnnouncementDetails } from "./AnnouncementDetails";
import type { Announcement } from "@/types/announcement";
import type { AnnouncementFormValues } from "@/utils/validators";

export function AnnouncementFeed() {
  const {
    announcements,
    loading,
    error,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    refresh,
  } = useAnnouncements();
    console.log("🔥 ANNOUNCEMENT FORM RENDERED");


  // Dialog & Details states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const handleOpenAddModal = () => {
    setEditingAnnouncement(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAnnouncement(null);
  };

  const handleFormSubmit = async (data: AnnouncementFormValues) => {
    try {
      if (editingAnnouncement) {
        await updateAnnouncement(editingAnnouncement.id, data.title, data.content);
      } else {
        await createAnnouncement(data.title, data.content);
      }
      handleCloseForm();
    } catch (error) {
      // Error is handled in hook toast
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        subtitle="Company-wide updates and communications"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={loading}
              className="h-9 rounded-xl cursor-pointer"
              title="Refresh announcements"
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            </Button>

            <RoleGuard roles={["admin", "hr"]}>
              <Button
                size="sm"
                onClick={handleOpenAddModal}
                className="gap-1.5 h-9 rounded-xl cursor-pointer bg-primary hover:bg-primary/95 text-primary-foreground font-semibold"
              >
                <Plus className="size-4" />
                New Announcement
              </Button>
            </RoleGuard>
          </div>
        }
      />

      {error ? (
        <ErrorState
          title="Failed to load announcements"
          description={error}
          onRetry={refresh}
        />
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-2xl border border-border bg-card space-y-4">
              <div className="flex justify-between items-start">
                <Skeleton className="h-6 w-3/4 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-5/6 rounded-md" />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Skeleton className="size-5 rounded-full" />
                <Skeleton className="h-3 w-20 rounded-md" />
                <Skeleton className="h-3 w-16 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements yet"
          description="When Admin or HR posts announcements, they will appear here."
          action={
            <RoleGuard roles={["admin", "hr"]}>
              <Button
                onClick={handleOpenAddModal}
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl"
              >
                Post First Announcement
              </Button>
            </RoleGuard>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {announcements.map((ann) => (
            <AnnouncementCard
              key={ann.id}
              announcement={ann}
              onView={setSelectedAnnouncement}
              onEdit={handleOpenEditModal}
              onDelete={deleteAnnouncement}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      {isFormOpen && (
        <AnnouncementDialog
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          announcement={editingAnnouncement}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Detailed Reading Dialog */}
      <AnnouncementDetails
        isOpen={!!selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
        announcement={selectedAnnouncement}
      />
    </div>
  );
}
