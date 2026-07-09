"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft, CheckCircle2, Eye, EyeOff, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { activateAccountSchema, type ActivateAccountFormValues } from "@/utils/validators";
import { authService } from "@/services/auth.service";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { cn } from "@/lib/utils";

export default function ActivateAccountPage() {
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<ActivateAccountFormValues>({
        resolver: zodResolver(activateAccountSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const passwordValue = watch("password") || "";

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

    const strength = evaluatePassword(passwordValue);

    const onSubmit = async (data: ActivateAccountFormValues) => {
        setErrorMsg(null);
        try {
            // 1. Search employee profile by email
            const employee = await authService.findEmployeeByEmail(data.email);
            if (!employee) {
                setErrorMsg("Employee record not found. Contact HR.");
                toast.error("Employee record not found.");
                return;
            }

            // 2. Validate activation eligibility
            if (employee.authCreated) {
                setErrorMsg("Account already activated. Please login.");
                toast.error("Account already activated.");
                return;
            }

            if (employee.status === "inactive") {
                setErrorMsg("This employee record has been disabled. Contact HR.");
                toast.error("Employee record disabled.");
                return;
            }

            if (employee.status !== "invited") {
                setErrorMsg("Account cannot be activated. Contact HR.");
                toast.error("Invalid invitation status.");
                return;
            }

            // 3. Create Firebase Auth user, link UID to Firestore doc, sign out auto-session
            await authService.activateEmployeeAccount(data.email, data.password, employee.employeeId!);

            setIsSuccess(true);
            toast.success("Account activated successfully! Redirecting to Sign In...");

            // Redirection delay
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch (err: any) {
            console.error("Activation failed:", err);
            const msg = err?.message || "Activation failed. Please try again.";
            setErrorMsg(msg);
            toast.error(msg);
        }
    };

    if (isSuccess) {
        return (
            <AuthCard>
                <div className="flex flex-col items-center text-center gap-4 py-4">
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                        <CheckCircle2 className="size-8 text-primary animate-pulse" />
                    </div>
                    <AuthHeader
                        title="Activation Complete"
                        description="Your HRMS account has been successfully activated and linked. You will be redirected to the sign in page shortly."
                        showLogo={false}
                    />
                    <Link href="/login" className="w-full mt-2">
                        <Button className="w-full font-bold h-10 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground" size="lg">
                            Go to Sign In
                        </Button>
                    </Link>
                </div>
            </AuthCard>
        );
    }

    return (
        <AuthCard>
            <AuthHeader
                title="Activate Account"
                description="Verify your corporate email and set your password to activate your account."
            />

            {errorMsg && (
                <div
                    className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs font-semibold text-destructive animate-fade-in"
                    role="alert"
                >
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
                {/* Email Field */}
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-sm font-semibold text-foreground/90">
                        Corporate Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        {...register("email")}
                        disabled={isSubmitting}
                        className={cn(
                            "flex h-10 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                            errors.email ? "border-destructive focus-visible:ring-destructive" : ""
                        )}
                    />
                    {errors.email && (
                        <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
                    )}
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="password" className="text-sm font-semibold text-foreground/90">
                        Create Password
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPass ? "text" : "password"}
                            placeholder="••••••••"
                            {...register("password")}
                            disabled={isSubmitting}
                            className={cn(
                                "flex h-10 w-full rounded-xl border border-input bg-transparent pl-3 pr-10 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                                errors.password ? "border-destructive focus-visible:ring-destructive" : ""
                            )}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                            disabled={isSubmitting}
                        >
                            {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-xs text-destructive font-medium">{errors.password.message}</p>
                    )}
                </div>

                {/* Password Strength Indicator */}
                {passwordValue && (
                    <div className="space-y-2.5 p-3 rounded-xl border border-border bg-muted/30">
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

                        <div className="grid grid-cols-1 gap-y-1.5 text-xs pt-1">
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
                                    One uppercase and one lowercase letter
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {strength.checks.number && strength.checks.special ? (
                                    <Check className="size-3.5 text-emerald-500 shrink-0" />
                                ) : (
                                    <X className="size-3.5 text-muted-foreground/60 shrink-0" />
                                )}
                                <span className={cn(strength.checks.number && strength.checks.special ? "text-foreground font-medium" : "text-muted-foreground")}>
                                    One digit number and one special symbol
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirm Password Field */}
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground/90">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <input
                            id="confirmPassword"
                            type={showConfirm ? "text" : "password"}
                            placeholder="••••••••"
                            {...register("confirmPassword")}
                            disabled={isSubmitting}
                            className={cn(
                                "flex h-10 w-full rounded-xl border border-input bg-transparent pl-3 pr-10 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
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
                        <p className="text-xs text-destructive font-medium">{errors.confirmPassword.message}</p>
                    )}
                </div>

                {/* Submit button */}
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full font-bold h-10 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground mt-2"
                >
                    {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Activate Account
                </Button>
            </form>

            {/* Back to Login Link */}
            <div className="flex items-center justify-center mt-4">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm p-1"
                >
                    <ArrowLeft className="size-3.5" />
                    Back to Sign In
                </Link>
            </div>
        </AuthCard>
    );
}
