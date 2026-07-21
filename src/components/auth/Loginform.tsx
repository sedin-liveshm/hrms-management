"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginFormValues } from "@/utils/validators";
import { useAuth } from "@/hooks/useAuth";
import { AuthCard } from "./AuthCard";
import { AuthHeader } from "./AuthHeader";


export function LoginForm() {
    const { login } = useAuth();
    const router = useRouter();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    });

    const onSubmit = async (data: LoginFormValues) => {
        setErrorMsg(null);
        try {
            await login(data.email, data.password, data.rememberMe);
            toast.success("Welcome back! Successfully logged in.");
            router.push("/dashboard");
        } catch (err: any) {
            const message = err?.message || "Invalid email or password.";
            setErrorMsg(message);
            toast.error(message);
        }
    };

    return (
        <AuthCard>
            <AuthHeader
                title="Welcome back"
                description="Sign in to your HRMS account"
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

                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                        <label
                            htmlFor="password"
                            className="text-sm font-semibold text-foreground/90"
                        >
                            Password
                        </label>
                        <Link
                            href="/forgot-password"
                            className="text-xs font-bold text-primary hover:underline hover:text-primary/95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? "password-error" : undefined}
                        disabled={isSubmitting}
                        className="h-10 rounded-xl"
                        {...register("password")}
                    />
                    {errors.password && (
                        <p id="password-error" className="text-xs text-destructive font-medium" role="alert">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2 select-none py-1">
                    <input
                        id="rememberMe"
                        type="checkbox"
                        disabled={isSubmitting}
                        className="size-4 accent-primary rounded border-input cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        {...register("rememberMe")}
                    />
                    <label
                        htmlFor="rememberMe"
                        className="text-xs font-semibold text-muted-foreground/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Remember me on this device
                    </label>
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
                    {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
            </form>
        </AuthCard>
    );
}
