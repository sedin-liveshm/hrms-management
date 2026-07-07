"use client";

import { useState, useEffect, useCallback } from "react";
import { announcementService } from "@/services/announcement.service";
import type { Announcement } from "@/types/announcement";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function useAnnouncements() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const fetchAnnouncements = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await announcementService.getAnnouncements();
            setAnnouncements(data);
        } catch (err: any) {
            console.error("fetchAnnouncements failed:", err);
            const msg = err?.message || "Failed to load announcements.";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    const createAnnouncement = async (title: string, content: string): Promise<Announcement> => {
        if (!user) {
            const msg = "You must be logged in to create announcements.";
            toast.error(msg);
            throw new Error(msg);
        }
        try {
            const createdByName = user.displayName || "HR Admin";
            const newAnn = await announcementService.createAnnouncement(
                title,
                content,
                user.uid,
                createdByName
            );
            console.log(newAnn);
            toast.success("Announcement Created");
            await fetchAnnouncements();
            return newAnn;
        } catch (err: any) {
            const msg = err?.message || "Failed to create announcement.";
            toast.error(msg);
            throw err;
        }

    };

    const updateAnnouncement = async (id: string, title: string, content: string): Promise<void> => {
        try {
            await announcementService.updateAnnouncement(id, { title, content });
            toast.success("Announcement Updated");
            await fetchAnnouncements();
        } catch (err: any) {
            const msg = err?.message || "Failed to update announcement.";
            toast.error(msg);
            throw err;
        }
    };

    const deleteAnnouncement = async (id: string): Promise<void> => {
        try {
            await announcementService.deleteAnnouncement(id);
            toast.success("Announcement Deleted");
            await fetchAnnouncements();
        } catch (err: any) {
            const msg = err?.message || "Failed to delete announcement.";
            toast.error(msg);
            throw err;
        }
    };

    return {
        announcements,
        loading,
        error,
        createAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        refresh: fetchAnnouncements,
    };
}
