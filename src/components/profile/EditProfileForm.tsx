"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormValues } from "@/utils/validators";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/types/profile";

interface EditProfileFormProps {
    isOpen: boolean;
    onClose: () => void;
    profile: UserProfile;
    onSubmit: (data: ProfileFormValues) => Promise<void>;
    isSubmitting: boolean;
}

export function EditProfileForm({
    isOpen,
    onClose,
    profile,
    onSubmit,
    isSubmitting,
}: EditProfileFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: profile.name || profile.displayName || "",
            phone: profile.phone || "",
            gender: (profile.gender || "male") as "male" | "female" | "other",
            dateOfBirth: profile.dateOfBirth || "",
        },
    });

    const genderValue = watch("gender");

    // Sync form values if profile changes or on open
    useEffect(() => {
        if (isOpen && profile) {
            reset({
                name: profile.name || profile.displayName || "",
                phone: profile.phone || "",
                gender: (profile.gender || "male") as "male" | "female" | "other",
                dateOfBirth: profile.dateOfBirth || "",
            });
        }
    }, [profile, reset, isOpen]);

    const handleFormSubmit = async (data: ProfileFormValues) => {
        try {
            await onSubmit(data);
            onClose();
        } catch {
            // Errors handled by caller hook
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md rounded-2xl border border-border bg-card text-card-foreground shadow-lg focus-visible:outline-hidden">
                <DialogHeader className="pb-3 border-b border-border">
                    <DialogTitle className="text-xl font-bold text-foreground">
                        Edit Personal Profile
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-3" noValidate>
                    {/* Name Field */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="edit-name" className="text-sm font-semibold text-foreground/90">
                            Full Name *
                        </label>
                        <input
                            id="edit-name"
                            type="text"
                            placeholder="e.g. John Doe"
                            {...register("name")}
                            disabled={isSubmitting}
                            className={cn(
                                "flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                                errors.name ? "border-destructive focus-visible:ring-destructive" : ""
                            )}
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive font-medium">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Phone Field */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="edit-phone" className="text-sm font-semibold text-foreground/90">
                            Mobile Number *
                        </label>
                        <input
                            id="edit-phone"
                            type="tel"
                            placeholder="e.g. +1 555-0199"
                            {...register("phone")}
                            disabled={isSubmitting}
                            className={cn(
                                "flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                                errors.phone ? "border-destructive focus-visible:ring-destructive" : ""
                            )}
                        />
                        {errors.phone && (
                            <p className="text-xs text-destructive font-medium">{errors.phone.message}</p>
                        )}
                    </div>

                    {/* Gender Select Field */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-foreground/90">Gender *</label>
                        <Select
                            value={genderValue}
                            onValueChange={(val) => setValue("gender", val as any)}
                            disabled={isSubmitting}
                        >
                            <SelectTrigger
                                className={cn(
                                    "h-9 rounded-lg border border-input bg-transparent px-3 text-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring",
                                    errors.gender ? "border-destructive focus-visible:ring-destructive" : ""
                                )}
                            >
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.gender && (
                            <p className="text-xs text-destructive font-medium">{errors.gender.message}</p>
                        )}
                    </div>

                    {/* Date of Birth Field */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="edit-dob" className="text-sm font-semibold text-foreground/90">
                            Date of Birth *
                        </label>
                        <input
                            id="edit-dob"
                            type="date"
                            {...register("dateOfBirth")}
                            disabled={isSubmitting}
                            className={cn(
                                "flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                                errors.dateOfBirth ? "border-destructive focus-visible:ring-destructive" : ""
                            )}
                        />
                        {errors.dateOfBirth && (
                            <p className="text-xs text-destructive font-medium">{errors.dateOfBirth.message}</p>
                        )}
                    </div>

                    {/* Actions Footer */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="h-9 rounded-xl cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-9 rounded-xl cursor-pointer bg-primary hover:bg-primary/95 text-primary-foreground font-semibold"
                        >
                            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
