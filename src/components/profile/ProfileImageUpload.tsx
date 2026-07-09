"use client";

import React, { useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProfileImageUploadProps {
    photoURL: string | null | undefined;
    name: string;
    onUpload: (file: File) => Promise<string | undefined>;
    onRemove: () => Promise<void>;
    isUploading: boolean;
    className?: string;
}

export function ProfileImageUpload({
    photoURL,
    name,
    onUpload,
    onRemove,
    isUploading,
    className,
}: ProfileImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getInitials = (userName: string) => {
        if (!userName) return "U";
        return userName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    const handleContainerClick = () => {
        if (isUploading) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate type (must be an image)
        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image file.");
            return;
        }

        // Validate size (max 2MB)
        const maxSizeBytes = 2 * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            toast.error("Profile picture size must be less than 2MB.");
            return;
        }

        try {
            await onUpload(file);
            // Reset input value so same file can be selected again
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (error) {
            // Errors handled by caller hook
        }
    };

    const handleRemoveClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isUploading) return;
        if (confirm("Are you sure you want to remove your profile picture?")) {
            try {
                await onRemove();
            } catch (error) {
                // Errors handled by caller hook
            }
        }
    };

    return (
        <div className={cn("flex flex-col items-center gap-3", className)}>
            <div
                onClick={handleContainerClick}
                className={cn(
                    "relative group size-28 rounded-full border-2 border-border cursor-pointer overflow-hidden flex items-center justify-center bg-muted transition-all duration-200 hover:border-primary/60",
                    isUploading && "pointer-events-none opacity-80"
                )}
                title="Click to upload profile photo"
            >
                {/* Input file */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    disabled={isUploading}
                />

                {/* Display Image */}
                <Avatar className="size-full">
                    <AvatarImage src={photoURL || ""} alt={name} className="object-cover size-full" />
                    <AvatarFallback className="text-2xl font-bold bg-muted text-muted-foreground select-none">
                        {getInitials(name)}
                    </AvatarFallback>
                </Avatar>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Camera className="size-6 text-white" />
                    <span className="text-[10px] text-white font-medium mt-1">Upload Photo</span>
                </div>

                {/* Loading Spinner */}
                {isUploading && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                        <Loader2 className="size-6 animate-spin text-primary" />
                    </div>
                )}
            </div>

            {/* Remove Photo Action */}
            {photoURL && !isUploading && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveClick}
                    className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl cursor-pointer"
                >
                    <Trash2 className="size-3.5" />
                    Remove Photo
                </Button>
            )}
        </div>
    );
}
