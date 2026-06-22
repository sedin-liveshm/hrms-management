import { z } from "zod";


export const passwordSchema = z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
    );

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Email address is required")
        .email("Please enter a valid email address"),
    password: z
        .string()
        .min(1, "Password is required")
        .min(8, "Password must be at least 8 characters"),
    rememberMe: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, "Email address is required")
        .email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
    .object({
        password: passwordSchema,
        confirmPassword: z.string().min(1, "Confirm password is required"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });
export const employeeSchema = z.object({
    employeeId: z.string().min(1, "Employee ID is required"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    gender: z.string().min(1, "Gender is required"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    department: z.string().min(1, "Department is required"),
    designation: z.string().min(1, "Designation is required"),
    role: z.enum(["admin", "hr", "manager", "employee"] as const),
    manager: z.string().optional().or(z.literal("")),
    joiningDate: z.string().min(1, "Joining date is required"),
    salary: z.coerce.number().min(0, "Salary must be a positive number"),
    status: z.enum(["active", "inactive", "on-leave"] as const),
    photoURL: z.string().url("Please enter a valid image URL").optional().or(z.literal("")).or(z.null()),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
