"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/utils/validators";
import { useAuth } from "@/hooks/useAuth";
import { AuthCard } from "./AuthCard";
import { AuthHeader } from "./AuthHeader";

export function ForgotPasswordForm() {
    const { resetPassword } = useAuth();
    const [isSent, setIsSent] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: ForgotPasswordFormValues) => {
        setErrorMsg(null);
        try {
            await resetPassword(data.email);
            setIsSent(true);
            toast.success("Password reset email sent successfully!");
        } catch (err: any) {
            const message = err?.message || "Failed to send reset link. Please try again.";
            setErrorMsg(message);
            toast.error(message);
        }
    };

    if (isSent) {
        return (
            <AuthCard>
                <div className="flex flex-col items-center text-center gap-4 py-4">
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                        <CheckCircle2 className="size-8 text-primary animate-pulse" />
                    </div>
                    <AuthHeader
                        title="Check your email"
                        description="We have sent a password reset link to your email address. Please follow the instructions inside to set a new password."
                        showLogo={false}
                    />
                    <Link href="/login" className="w-full mt-2">
                        <Button className="w-full font-bold h-10 rounded-xl" size="lg">
                            Back to Sign In
                        </Button>
                    </Link>
                </div>
            </AuthCard>
        );
    }

    return (
        <AuthCard>
            <AuthHeader
                title="Forgot password?"
                description="No worries, enter your email and we'll send you a link to reset it."
            />

            {errorMsg && (
                <div
                    className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs font-semibold text-destructive animate-fade-in"
                    role="alert"
                >
                    {errorMsg}
                </div>
            )}

            <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="flex flex-col gap-4"
            >
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="email"
                        className="text-sm font-semibold text-foreground/90"
                    >
                        Email address
                    </label>
                    <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@company.com"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                        disabled={isSubmitting}
                        className="h-10 rounded-xl"
                        {...register("email")}
                    />
                    {errors.email && (
                        <p id="email-error" className="text-xs text-destructive font-medium" role="alert">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="mt-2 w-full font-bold h-10 cursor-pointer rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
                    disabled={isSubmitting}
                    size="lg"
                >
                    {isSubmitting && (
                        <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                    )}
                    {isSubmitting ? "Sending Link..." : "Send Reset Link"}
                </Button>

                <div className="text-center mt-2">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground/80 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm py-1"
                    >
                        <ArrowLeft className="size-3.5" />
                        Back to Sign In
                    </Link>
                </div>
            </form>
        </AuthCard>
    );
}
