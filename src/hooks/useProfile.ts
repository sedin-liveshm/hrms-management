"use client";

import { useState, useCallback } from "react";
import { useAuthStore } from "@/store/auth-store";
import { profileService } from "@/services/profile.service";
import type { UserProfile } from "@/types/profile";
import { toast } from "sonner";

export function useProfile() {
    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);

    const profile = user as UserProfile | null;
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);

    /**
     * Refresh current profile details from backend
     */
    const refreshProfile = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const refreshed = await profileService.getProfile(user.uid);
            if (refreshed) {
                setUser(refreshed);
            }
        } catch (err: unknown) {
            console.error("refreshProfile failed:", err);
            const msg = err instanceof Error ? err.message : "Failed to refresh profile details.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [user, setUser]);

    /**
     * Update personal profile fields
     */
    const updateProfile = useCallback(
        async (data: Partial<UserProfile>) => {
            if (!user) {
                toast.error("You must be logged in to update your profile.");
                return;
            }
            setUpdating(true);
            try {
                await profileService.updateProfile(user.uid, data);

                // Fetch updated doc and sync store
                const refreshed = await profileService.getProfile(user.uid);
                if (refreshed) {
                    setUser(refreshed);
                }

                toast.success("Profile updated successfully.");
            } catch (err: unknown) {
                console.error("updateProfile failed:", err);
                const msg = err instanceof Error ? err.message : "Failed to update profile.";
                toast.error(msg);
                throw err;
            } finally {
                setUpdating(false);
            }
        },
        [user, setUser]
    );

    /**
     * Upload and set new profile avatar picture
     */
    const uploadImage = useCallback(
        async (file: File) => {
            if (!user) {
                toast.error("You must be logged in to upload an avatar.");
                return;
            }
            setUpdating(true);
            try {
                const downloadURL = await profileService.uploadProfileImage(user.uid, file);

                // Fetch updated doc and sync store
                const refreshed = await profileService.getProfile(user.uid);
                if (refreshed) {
                    setUser(refreshed);
                }

                toast.success("Profile picture updated successfully.");
                return downloadURL;
            } catch (err: unknown) {
                console.error("uploadImage failed:", err);
                const msg = err instanceof Error ? err.message : "Failed to upload profile picture.";
                toast.error(msg);
                throw err;
            } finally {
                setUpdating(false);
            }
        },
        [user, setUser]
    );

    /**
     * Clear profile picture setting
     */
    const removeImage = useCallback(async () => {
        if (!user) {
            toast.error("You must be logged in to remove your avatar.");
            return;
        }
        setUpdating(true);
        try {
            await profileService.removeProfileImage(user.uid);

            // Fetch updated doc and sync store
            const refreshed = await profileService.getProfile(user.uid);
            if (refreshed) {
                setUser(refreshed);
            }

            toast.success("Profile picture removed successfully.");
        } catch (err: unknown) {
            console.error("removeImage failed:", err);
            const msg = err instanceof Error ? err.message : "Failed to remove profile picture.";
            toast.error(msg);
            throw err;
        } finally {
            setUpdating(false);
        }
    }, [user, setUser]);

    /**
     * Reauthenticate and set a new login password
     */
    const changePassword = useCallback(
        async (currentPass: string, newPass: string) => {
            if (!user || !user.email) {
                toast.error("User session email context not found.");
                return;
            }
            setUpdating(true);
            try {
                await profileService.changePassword(user.email, currentPass, newPass);
                toast.success("Password changed successfully.");
            } catch (err: unknown) {
                console.error("changePassword failed:", err);
                const msg = err instanceof Error ? err.message : "Failed to change password.";
                toast.error(msg);
                throw err;
            } finally {
                setUpdating(false);
            }
        },
        [user]
    );

    return {
        profile,
        loading,
        updating,
        updateProfile,
        uploadImage,
        removeImage,
        changePassword,
        refreshProfile,
    };
}
