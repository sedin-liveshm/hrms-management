import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmployeeStatusBadge } from "./EmployeeStatusBadge";
import type { Employee } from "@/types/employee";
import {
    Briefcase,
    Calendar,
    DollarSign,
    Mail,
    Phone,
    User,
    Shield,
    Clock,
    Umbrella,
    CreditCard,
    MapPin,
} from "lucide-react";

interface EmployeeDetailsProps {
    employee: Employee;
}

export function EmployeeDetails({ employee }: EmployeeDetailsProps) {
    const initials = employee.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    // Format currency (INR)
    const formatSalary = (val: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(val);
    };

    // Format Date (long format)
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "N/A";
        try {
            return new Date(dateStr).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Column: Quick Profile Summary Card */}
            <Card className="lg:col-span-1 rounded-2xl border-border bg-card text-card-foreground shadow-sm h-fit">
                <CardContent className="pt-8 flex flex-col items-center text-center">
                    <Avatar className="size-28 border-4 border-primary/20 shadow-md">
                        <AvatarImage src={employee.photoURL || undefined} alt={employee.name} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">
                            {initials}
                        </AvatarFallback>
                    </Avatar>

                    <h2 className="text-xl font-bold text-foreground mt-4 leading-tight">
                        {employee.name}
                    </h2>
                    <p className="text-sm text-muted-foreground font-medium mt-1">
                        {employee.designation}
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                        <EmployeeStatusBadge status={employee.status} />
                        <span className="capitalize text-[10px] font-bold text-foreground bg-muted border border-border px-2 py-0.5 rounded-md">
                            {employee.role}
                        </span>
                    </div>

                    <div className="w-full border-t border-border mt-6 pt-6 space-y-3.5 text-left">
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="size-4.5 text-muted-foreground shrink-0" />
                            <span className="text-foreground/90 truncate" title={employee.email}>
                                {employee.email}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Phone className="size-4.5 text-muted-foreground shrink-0" />
                            <span className="text-foreground/90">{employee.phone || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <MapPin className="size-4.5 text-muted-foreground shrink-0" />
                            <span className="text-foreground/90">{employee.department}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Right Column: Detailed Tabs/Cards Grid */}
            <div className="lg:col-span-2 space-y-6">

                {/* Job & Personal Details Cards */}
                <Card className="rounded-2xl border-border bg-card text-card-foreground shadow-sm">
                    <CardHeader className="border-b border-border pb-4">
                        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                            <Briefcase className="size-5 text-primary" />
                            Employment Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                        <DetailItem label="Employee ID" value={employee.employeeId} icon={<Shield className="size-4" />} />
                        <DetailItem label="Department" value={employee.department} icon={<Briefcase className="size-4" />} />
                        <DetailItem label="Designation" value={employee.designation} icon={<User className="size-4" />} />
                        <DetailItem label="Joining Date" value={formatDate(employee.joiningDate)} icon={<Calendar className="size-4" />} />
                        <DetailItem label="Reporting Manager" value={employee.manager || "Not Specified"} icon={<User className="size-4" />} />
                        <DetailItem label="Salary (Annual)" value={formatSalary(employee.salary)} icon={<DollarSign className="size-4" />} />
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-border bg-card text-card-foreground shadow-sm">
                    <CardHeader className="border-b border-border pb-4">
                        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                            <User className="size-5 text-secondary" />
                            Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                        <DetailItem label="Gender" value={employee.gender} className="capitalize" icon={<User className="size-4" />} />
                        <DetailItem label="Date of Birth" value={formatDate(employee.dateOfBirth)} icon={<Calendar className="size-4" />} />
                    </CardContent>
                </Card>

                {/* Future Modules Section (Attendance, Leaves, Payroll placeholders) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FutureSummaryCard
                        title="Attendance Summary"
                        description="Punch logs & Timesheet tracking"
                        icon={<Clock className="size-5 text-muted-foreground" />}
                    />
                    <FutureSummaryCard
                        title="Leave Summary"
                        description="Remaining balances & approvals"
                        icon={<Umbrella className="size-5 text-muted-foreground" />}
                    />
                    <FutureSummaryCard
                        title="Payroll Summary"
                        description="Tax statements & payslip generator"
                        icon={<CreditCard className="size-5 text-muted-foreground" />}
                    />
                </div>

            </div>
        </div>
    );
}

// Helper component for structured label-value pairs
function DetailItem({
    label,
    value,
    className,
    icon,
}: {
    label: string;
    value: string;
    className?: string;
    icon?: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3">
            {icon && <div className="mt-0.5 text-muted-foreground/60 shrink-0">{icon}</div>}
            <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {label}
                </span>
                <span className={`text-sm font-medium text-foreground mt-0.5 ${className || ""}`}>
                    {value}
                </span>
            </div>
        </div>
    );
}

// Reusable card for future features
function FutureSummaryCard({
    title,
    description,
    icon,
}: {
    title: string;
    description: string;
    icon: React.ReactNode;
}) {
    return (
        <Card className="rounded-2xl border-border bg-card/60 text-card-foreground shadow-sm border-dashed">
            <CardContent className="pt-6 flex flex-col items-center text-center">
                <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                    {icon}
                </div>
                <h4 className="text-sm font-bold text-foreground mt-3 leading-none">
                    {title}
                </h4>
                <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">
                    {description}
                </p>
                <span className="mt-4 px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[9px] font-bold uppercase tracking-wider select-none">
                    Coming Soon
                </span>
            </CardContent>
        </Card>
    );
}
