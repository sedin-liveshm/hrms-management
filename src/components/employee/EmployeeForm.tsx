import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { employeeSchema, type EmployeeFormValues } from "@/utils/validators";
import { employeeService } from "@/services/employee.service";
import type { Employee } from "@/types/employee";

interface EmployeeFormProps {
    isOpen: boolean;
    onClose: () => void;
    employee?: Employee | null;
    onSubmit: (data: EmployeeFormValues) => Promise<void>;
}

export function EmployeeForm({
    isOpen,
    onClose,
    employee,
    onSubmit,
}: EmployeeFormProps) {
    const isEdit = !!employee;

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<EmployeeFormValues>({
        resolver: zodResolver(employeeSchema) as any,
        defaultValues: {
            employeeId: "",
            name: "",
            email: "",
            phone: "",
            gender: "male",
            dateOfBirth: "",
            department: "Engineering",
            designation: "",
            role: "employee",
            manager: "",
            managerId: "",
            managerName: "",
            joiningDate: new Date().toISOString().split("T")[0],
            salary: 0,
            status: "active",
            photoURL: "",
        },
    });

    const [managers, setManagers] = useState<Employee[]>([]);

    useEffect(() => {
        const fetchManagers = async () => {
            try {
                const mgrs = await employeeService.getManagers();
                setManagers(mgrs);
            } catch (err) {
                console.error("Failed to load managers list:", err);
            }
        };
        if (isOpen) {
            fetchManagers();
        }
    }, [isOpen]);

    // Keep track of values for customized select elements that don't use standard register
    const genderValue = watch("gender");
    const departmentValue = watch("department");
    const roleValue = watch("role");
    const statusValue = watch("status");

    // Sync form values when the edit employee details change
    useEffect(() => {
        if (employee) {
            reset({
                employeeId: employee.employeeId || "",
                name: employee.name || "",
                email: employee.email || "",
                phone: employee.phone || "",
                gender: employee.gender || "male",
                dateOfBirth: employee.dateOfBirth || "",
                department: employee.department || "Engineering",
                designation: employee.designation || "",
                role: employee.role || "employee",
                manager: employee.manager || "",
                managerId: employee.managerId || "",
                managerName: employee.managerName || "",
                joiningDate: employee.joiningDate || "",
                salary: employee.salary || 0,
                status: employee.status || "active",
                photoURL: employee.photoURL || "",
            });
        } else {
            // Auto-generate employee ID for new hires
            const randomId = `EMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
            reset({
                employeeId: randomId,
                name: "",
                email: "",
                phone: "",
                gender: "male",
                dateOfBirth: "",
                department: "Engineering",
                designation: "",
                role: "employee",
                manager: "",
                managerId: "",
                managerName: "",
                joiningDate: new Date().toISOString().split("T")[0],
                salary: 0,
                status: "active",
                photoURL: "",
            });
        }
    }, [employee, reset, isOpen]);

    const handleFormSubmit = async (data: EmployeeFormValues) => {
        // If photoURL is empty, select a matching aesthetic random avatar based on gender for best visual results
        if (!data.photoURL) {
            const maleAvatars = [
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
                "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200",
            ];
            const femaleAvatars = [
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
            ];
            const selectedList = data.gender === "female" ? femaleAvatars : maleAvatars;
            data.photoURL = selectedList[Math.floor(Math.random() * selectedList.length)];
        }

        try {
            const finalData = { ...data };
            if (finalData.role !== "employee") {
                finalData.managerId = null;
                finalData.managerName = null;
                finalData.manager = "";
            }
            await onSubmit(finalData);
            onClose();
        } catch (error) {
            // Handled in caller hook
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-border bg-card text-card-foreground shadow-lg">
                <DialogHeader className="pb-2 border-b border-border">
                    <DialogTitle className="text-xl font-bold text-foreground">
                        {isEdit ? "Edit Employee Profile" : "Add New Employee"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4" noValidate>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Employee ID */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="employeeId" className="text-sm font-semibold text-foreground/90">
                                Employee ID *
                            </label>
                            <Input
                                id="employeeId"
                                disabled={isEdit || isSubmitting}
                                className="h-10 rounded-xl"
                                {...register("employeeId")}
                            />
                            {errors.employeeId && (
                                <span className="text-xs text-destructive font-medium">{errors.employeeId.message}</span>
                            )}
                        </div>

                        {/* Name */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="name" className="text-sm font-semibold text-foreground/90">
                                Full Name *
                            </label>
                            <Input
                                id="name"
                                placeholder="e.g. Aditi Rao"
                                disabled={isSubmitting}
                                className="h-10 rounded-xl"
                                {...register("name")}
                            />
                            {errors.name && (
                                <span className="text-xs text-destructive font-medium">{errors.name.message}</span>
                            )}
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="email" className="text-sm font-semibold text-foreground/90">
                                Email Address *
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="e.g. aditi.r@company.com"
                                disabled={isSubmitting}
                                className="h-10 rounded-xl"
                                {...register("email")}
                            />
                            {errors.email && (
                                <span className="text-xs text-destructive font-medium">{errors.email.message}</span>
                            )}
                        </div>

                        {/* Phone */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="phone" className="text-sm font-semibold text-foreground/90">
                                Phone Number *
                            </label>
                            <Input
                                id="phone"
                                placeholder="e.g. 9876543210"
                                disabled={isSubmitting}
                                className="h-10 rounded-xl"
                                {...register("phone")}
                            />
                            {errors.phone && (
                                <span className="text-xs text-destructive font-medium">{errors.phone.message}</span>
                            )}
                        </div>

                        {/* Gender */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-foreground/90">
                                Gender *
                            </label>
                            <Select
                                value={genderValue}
                                onValueChange={(val) => setValue("gender", val as any)}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger className="h-10 rounded-xl">
                                    <SelectValue placeholder="Select Gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.gender && (
                                <span className="text-xs text-destructive font-medium">{errors.gender.message}</span>
                            )}
                        </div>

                        {/* Date of Birth */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="dateOfBirth" className="text-sm font-semibold text-foreground/90">
                                Date of Birth *
                            </label>
                            <Input
                                id="dateOfBirth"
                                type="date"
                                disabled={isSubmitting}
                                className="h-10 rounded-xl"
                                {...register("dateOfBirth")}
                            />
                            {errors.dateOfBirth && (
                                <span className="text-xs text-destructive font-medium">{errors.dateOfBirth.message}</span>
                            )}
                        </div>

                        {/* Department */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-foreground/90">
                                Department *
                            </label>
                            <Select
                                value={departmentValue}
                                onValueChange={(val) => setValue("department", val as any)}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger className="h-10 rounded-xl">
                                    <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Engineering">Engineering</SelectItem>
                                    <SelectItem value="Design">Design</SelectItem>
                                    <SelectItem value="Product">Product</SelectItem>
                                    <SelectItem value="Human Resources">Human Resources</SelectItem>
                                    <SelectItem value="IT Administration">IT Administration</SelectItem>
                                    <SelectItem value="Product Management">Product Management</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.department && (
                                <span className="text-xs text-destructive font-medium">{errors.department.message}</span>
                            )}
                        </div>

                        {/* Designation */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="designation" className="text-sm font-semibold text-foreground/90">
                                Designation *
                            </label>
                            <Input
                                id="designation"
                                placeholder="e.g. Senior Software Engineer"
                                disabled={isSubmitting}
                                className="h-10 rounded-xl"
                                {...register("designation")}
                            />
                            {errors.designation && (
                                <span className="text-xs text-destructive font-medium">{errors.designation.message}</span>
                            )}
                        </div>

                        {/* System Role */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-foreground/90">
                                System Access Role *
                            </label>
                            <Select
                                value={roleValue}
                                onValueChange={(val) => setValue("role", val as any)}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger className="h-10 rounded-xl">
                                    <SelectValue placeholder="Select Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="hr">HR</SelectItem>
                                    <SelectItem value="manager">Manager</SelectItem>
                                    <SelectItem value="employee">Employee</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role && (
                                <span className="text-xs text-destructive font-medium">{errors.role.message}</span>
                            )}
                        </div>

                        {/* Line Manager */}
                        {roleValue === "employee" && (
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-foreground/90">
                                    Reporting Manager *
                                </label>
                                <Select
                                    value={watch("managerId") || ""}
                                    onValueChange={(val) => {
                                        const mgr = managers.find((m) => m.employeeId === val);
                                        if (mgr) {
                                            setValue("managerId", mgr.employeeId);
                                            setValue("managerName", mgr.name);
                                            setValue("manager", mgr.name); // sync legacy
                                        }
                                    }}
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger className="h-10 rounded-xl">
                                        <SelectValue placeholder="Select Manager" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {managers.map((mgr) => (
                                            <SelectItem key={mgr.employeeId} value={mgr.employeeId}>
                                                {mgr.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.managerId && (
                                    <span className="text-xs text-destructive font-medium">{errors.managerId.message}</span>
                                )}
                            </div>
                        )}

                        {/* Joining Date */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="joiningDate" className="text-sm font-semibold text-foreground/90">
                                Joining Date *
                            </label>
                            <Input
                                id="joiningDate"
                                type="date"
                                disabled={isSubmitting}
                                className="h-10 rounded-xl"
                                {...register("joiningDate")}
                            />
                            {errors.joiningDate && (
                                <span className="text-xs text-destructive font-medium">{errors.joiningDate.message}</span>
                            )}
                        </div>

                        {/* Salary */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="salary" className="text-sm font-semibold text-foreground/90">
                                Salary (Annual) *
                            </label>
                            <Input
                                id="salary"
                                type="number"
                                placeholder="0"
                                disabled={isSubmitting}
                                className="h-10 rounded-xl"
                                {...register("salary")}
                            />
                            {errors.salary && (
                                <span className="text-xs text-destructive font-medium">{errors.salary.message}</span>
                            )}
                        </div>

                        {/* Status */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-foreground/90">
                                Status *
                            </label>
                            <Select
                                value={statusValue}
                                onValueChange={(val) => setValue("status", val as any)}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger className="h-10 rounded-xl">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="on-leave">On Leave</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && (
                                <span className="text-xs text-destructive font-medium">{errors.status.message}</span>
                            )}
                        </div>

                        {/* Profile Image URL */}
                        <div className="flex flex-col gap-1 col-span-1 md:col-span-2">
                            <label htmlFor="photoURL" className="text-sm font-semibold text-foreground/90">
                                Profile Photo URL
                            </label>
                            <Input
                                id="photoURL"
                                placeholder="e.g. https://images.unsplash.com/... (leaves blank for random pre-selected avatar)"
                                disabled={isSubmitting}
                                className="h-10 rounded-xl"
                                {...register("photoURL")}
                            />
                            {errors.photoURL && (
                                <span className="text-xs text-destructive font-medium">{errors.photoURL.message}</span>
                            )}
                        </div>

                    </div>

                    <DialogFooter className="pt-4 border-t border-border gap-2 md:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isSubmitting}
                            onClick={onClose}
                            className="h-10 rounded-xl cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-10 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl cursor-pointer"
                        >
                            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                            {isEdit ? "Save Changes" : "Create Employee"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
