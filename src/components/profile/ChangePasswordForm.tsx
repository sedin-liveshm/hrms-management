"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, type ChangePasswordFormValues } from "@/utils/validators";
import { ProfileCard } from "./ProfileCard";
import { Button } from "@/components/ui/button";
import { Shield, Eye, EyeOff, Loader2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChangePasswordFormProps {
    onSubmit: (currentPass: string, newPass: string) => Promise<void>;
    isSubmitting: boolean;
}

export function ChangePasswordForm({ onSubmit, isSubmitting }: ChangePasswordFormProps) {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<ChangePasswordFormValues>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const newPasswordValue = watch("newPassword") || "";

    // Evaluate password strength
    const evaluatePassword = (password: string) => {
        const checks = {
            length: password.length >= 8,
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[^A-Za-z0-9]/.test(password),
        };
        const score = Object.values(checks).filter(Boolean).length;
        let label = "Very Weak";
        let color = "bg-destructive";

        if (score === 5) {
            label = "Strong";
            color = "bg-emerald-500";
        } else if (score >= 4) {
            label = "Good";
            color = "bg-primary";
        } else if (score >= 3) {
            label = "Fair";
            color = "bg-amber-500";
        } else if (score >= 2) {
            label = "Weak";
            color = "bg-amber-600";
        }
        return { score, label, color, checks };
    };

    const strength = evaluatePassword(newPasswordValue);

    const handleFormSubmit = async (data: ChangePasswordFormValues) => {
        try {
            await onSubmit(data.currentPassword, data.newPassword);
            reset(); // Clear passwords on success
        } catch {
            // Errors handled by caller hook
        }
    };

    return (
        <div className="max-w-2xl">
            <ProfileCard title="Change Login Password" icon={Shield}>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5" noValidate>
                    {/* Current Password */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="currentPassword" className="text-sm font-semibold text-foreground/90">
                            Current Password
                        </label>
                        <div className="relative">
                            <input
                                id="currentPassword"
                                type={showCurrent ? "text" : "password"}
                                placeholder="Enter current password"
                                {...register("currentPassword")}
                                disabled={isSubmitting}
                                className={cn(
                                    "flex h-9 w-full rounded-lg border border-input bg-transparent pl-3 pr-10 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                                    errors.currentPassword ? "border-destructive focus-visible:ring-destructive" : ""
                                )}
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                                disabled={isSubmitting}
                            >
                                {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                        {errors.currentPassword && (
                            <p className="text-xs text-destructive font-medium">
                                {errors.currentPassword.message}
                            </p>
                        )}
                    </div>

                    {/* New Password */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="newPassword" className="text-sm font-semibold text-foreground/90">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                id="newPassword"
                                type={showNew ? "text" : "password"}
                                placeholder="Enter new password"
                                {...register("newPassword")}
                                disabled={isSubmitting}
                                className={cn(
                                    "flex h-9 w-full rounded-lg border border-input bg-transparent pl-3 pr-10 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                                    errors.newPassword ? "border-destructive focus-visible:ring-destructive" : ""
                                )}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                                disabled={isSubmitting}
                            >
                                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                        {errors.newPassword && (
                            <p className="text-xs text-destructive font-medium">
                                {errors.newPassword.message}
                            </p>
                        )}
                    </div>

                    {/* Password Strength Indicator Bars */}
                    {newPasswordValue && (
                        <div className="space-y-2.5 p-3 rounded-lg border border-border bg-muted/30">
                            <div className="flex items-center justify-between text-xs font-semibold">
                                <span className="text-muted-foreground">Password Strength:</span>
                                <span className={cn(
                                    strength.score >= 4 ? "text-emerald-600 dark:text-emerald-400" :
                                        strength.score >= 3 ? "text-amber-600 dark:text-amber-400" :
                                            "text-destructive"
                                )}>
                                    {strength.label}
                                </span>
                            </div>

                            {/* Strength Progress Indicator */}
                            <div className="flex gap-1 h-1.5 w-full rounded-full overflow-hidden bg-muted">
                                {[1, 2, 3, 4, 5].map((idx) => (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "flex-1 transition-colors duration-250",
                                            idx <= strength.score ? strength.color : "bg-border/60"
                                        )}
                                    />
                                ))}
                            </div>

                            {/* Requirement Checklist */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs pt-1">
                                <div className="flex items-center gap-1.5">
                                    {strength.checks.length ? (
                                        <Check className="size-3.5 text-emerald-500 shrink-0" />
                                    ) : (
                                        <X className="size-3.5 text-muted-foreground/60 shrink-0" />
                                    )}
                                    <span className={cn(strength.checks.length ? "text-foreground font-medium" : "text-muted-foreground")}>
                                        At least 8 characters
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {strength.checks.upper ? (
                                        <Check className="size-3.5 text-emerald-500 shrink-0" />
                                    ) : (
                                        <X className="size-3.5 text-muted-foreground/60 shrink-0" />
                                    )}
                                    <span className={cn(strength.checks.upper ? "text-foreground font-medium" : "text-muted-foreground")}>
                                        One uppercase letter
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {strength.checks.lower ? (
                                        <Check className="size-3.5 text-emerald-500 shrink-0" />
                                    ) : (
                                        <X className="size-3.5 text-muted-foreground/60 shrink-0" />
                                    )}
                                    <span className={cn(strength.checks.lower ? "text-foreground font-medium" : "text-muted-foreground")}>
                                        One lowercase letter
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {strength.checks.number ? (
                                        <Check className="size-3.5 text-emerald-500 shrink-0" />
                                    ) : (
                                        <X className="size-3.5 text-muted-foreground/60 shrink-0" />
                                    )}
                                    <span className={cn(strength.checks.number ? "text-foreground font-medium" : "text-muted-foreground")}>
                                        One number digit
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {strength.checks.special ? (
                                        <Check className="size-3.5 text-emerald-500 shrink-0" />
                                    ) : (
                                        <X className="size-3.5 text-muted-foreground/60 shrink-0" />
                                    )}
                                    <span className={cn(strength.checks.special ? "text-foreground font-medium" : "text-muted-foreground")}>
                                        One special symbol character
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Confirm Password */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground/90">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                id="confirmPassword"
                                type={showConfirm ? "text" : "password"}
                                placeholder="Confirm new password"
                                {...register("confirmPassword")}
                                disabled={isSubmitting}
                                className={cn(
                                    "flex h-9 w-full rounded-lg border border-input bg-transparent pl-3 pr-10 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                                    errors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""
                                )}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                                disabled={isSubmitting}
                            >
                                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-xs text-destructive font-medium">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    {/* Actions button */}
                    <div className="pt-2">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-10 rounded-xl cursor-pointer bg-primary hover:bg-primary/95 text-primary-foreground font-bold"
                        >
                            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Update Password
                        </Button>
                    </div>
                </form>
            </ProfileCard>
        </div>
    );
}
