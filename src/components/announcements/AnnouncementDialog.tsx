"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AnnouncementForm } from "./AnnouncementForm";
import type { Announcement } from "@/types/announcement";
import type { AnnouncementFormValues } from "@/utils/validators";

interface AnnouncementDialogProps {
    isOpen: boolean;
    onClose: () => void;
    announcement?: Announcement | null;
    onSubmit: (data: AnnouncementFormValues) => Promise<void>;
}

export function AnnouncementDialog({
    isOpen,
    onClose,
    announcement,
    onSubmit,
}: AnnouncementDialogProps) {
    const isEdit = !!announcement;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-xl rounded-2xl border border-border bg-card text-card-foreground shadow-lg focus-visible:outline-hidden">
                <DialogHeader className="pb-2 border-b border-border">
                    <DialogTitle className="text-xl font-bold text-foreground">
                        {isEdit ? "Edit Announcement" : "New Announcement"}
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    <AnnouncementForm
                        isOpen={isOpen}
                        announcement={announcement}
                        onSubmit={onSubmit}
                        onCancel={onClose}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
