import { z } from "zod";

/**
 * Password validation rules enforcing:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character
 */
export const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

/**
 * Login form validation schema
 */
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

/**
 * Forgot password form validation schema
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
});

/**
 * Reset password form validation schema (with confirmation match)
 */
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

/**
 * Employee validation schema for adding and editing employees
 */
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
  managerId: z.string().nullable().optional().or(z.literal("")),
  managerName: z.string().nullable().optional().or(z.literal("")),
  joiningDate: z.string().min(1, "Joining date is required"),
  salary: z.coerce.number().min(0, "Salary must be a positive number"),
  status: z.enum(["invited", "active", "inactive", "on-leave"] as const),
  photoURL: z.string().url("Please enter a valid image URL").optional().or(z.literal("")).or(z.null()),
}).refine(
  (data) => {
    if (data.role === "employee") {
      return !!data.managerId;
    }
    return true;
  },
  {
    message: "Reporting Manager is required for standard employees",
    path: ["managerId"],
  }
);

export type EmployeeFormValues = z.infer<typeof employeeSchema>;

/**
 * Announcement validation schema for adding and editing announcements
 */
export const announcementSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
});

export type AnnouncementFormValues = z.infer<typeof announcementSchema>;

/**
 * Profile validation schema for editing personal details
 */
export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+?[0-9\s\-()]{10,20}$/, "Invalid phone number format (min 10 digits)"),
  gender: z.enum(["male", "female", "other"], {
    message: "Gender is required",
  }),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

/**
 * Security validation schema for password updates
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

/**
 * Account Activation validation schema
 */
export const activateAccountSchema = z
  .object({
    email: z.string().min(1, "Email is required").email("Invalid email address format"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ActivateAccountFormValues = z.infer<typeof activateAccountSchema>;



