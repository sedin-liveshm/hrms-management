"use client";

import React from "react";
import { ProfileImageUpload } from "./ProfileImageUpload";
import { Badge } from "@/components/ui/badge";
import type { UserProfile } from "@/types/profile";
import { Building2, Briefcase, Hash } from "lucide-react";

interface ProfileHeaderProps {
    profile: UserProfile | null;
    onUploadImage: (file: File) => Promise<string | undefined>;
    onRemoveImage: () => Promise<void>;
    isUploading: boolean;
}

export function ProfileHeader({
    profile,
    onUploadImage,
    onRemoveImage,
    isUploading,
}: ProfileHeaderProps) {
    if (!profile) return null;

    const getRoleBadgeVariant = (role: string) => {
        switch (role?.toLowerCase()) {
            case "admin":
                return "destructive";
            case "hr":
                return "secondary";
            case "manager":
                return "outline";
            default:
                return "default";
        }
    };

    const getRoleBadgeStyle = (role: string) => {
        switch (role?.toLowerCase()) {
            case "admin":
                return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200";
            case "hr":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200";
            case "manager":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200";
            default:
                return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200";
        }
    };

    return (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xs">
            {/* Visual Background Banner */}
            <div className="h-32 w-full bg-gradient-to-r from-primary/30 via-accent/30 to-primary/20 dark:from-primary/10 dark:via-accent/10 dark:to-primary/5" />

            {/* Header Info Block */}
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 px-6 pb-6 -mt-12">
                {/* Avatar Upload Container */}
                <div className="relative z-10 bg-card p-1 rounded-full border border-border">
                    <ProfileImageUpload
                        photoURL={profile.photoURL}
                        name={profile.name || profile.displayName || "User"}
                        onUpload={onUploadImage}
                        onRemove={onRemoveImage}
                        isUploading={isUploading}
                    />
                </div>

                {/* User Details info */}
                <div className="flex-1 text-center md:text-left space-y-2.5 mt-4 md:mt-0 pb-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-2.5">
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">
                            {profile.name || profile.displayName || "User"}
                        </h1>
                        <div>
                            <Badge
                                variant={getRoleBadgeVariant(profile.role)}
                                className={`capitalize font-semibold select-none border rounded-lg px-2.5 py-0.5 ${getRoleBadgeStyle(
                                    profile.role
                                )}`}
                            >
                                {profile.role}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-1.5 text-sm text-muted-foreground font-medium">
                        <span className="flex items-center gap-1.5">
                            <Briefcase className="size-4 text-muted-foreground/80" />
                            {profile.designation || "No Designation"}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Building2 className="size-4 text-muted-foreground/80" />
                            {profile.department || "No Department"}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Hash className="size-4 text-muted-foreground/80" />
                            ID: {profile.employeeId || "No Employee ID"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
