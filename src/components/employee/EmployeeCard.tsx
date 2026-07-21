import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmployeeStatusBadge } from "./EmployeeStatusBadge";
import type { Employee } from "@/types/employee";
import { Mail, Phone, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface EmployeeCardProps {
    employee: Employee;
}

export function EmployeeCard({ employee }: EmployeeCardProps) {
    const initials = employee.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <Card className="rounded-2xl border-border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow relative group">
            <CardContent className="pt-6 pb-5 flex flex-col items-center text-center">

                {/* Detail Link button (top right) */}
                <Link
                    href={`/employees/${employee.uid}`}
                    className="absolute top-4 right-4 p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none transition-colors"
                    aria-label={`View ${employee.name}'s details`}
                >
                    <ArrowUpRight className="size-4" />
                </Link>

                {/* Avatar */}
                <Avatar className="size-16 border-2 border-primary/10">
                    <AvatarImage src={employee.photoURL || undefined} alt={employee.name} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-base font-bold text-primary">
                        {initials}
                    </AvatarFallback>
                </Avatar>

                {/* Title / Role */}
                <h3 className="font-bold text-foreground mt-3 leading-tight truncate w-full px-2">
                    {employee.name}
                </h3>
                <p className="text-xs text-muted-foreground font-medium truncate w-full px-2 mt-0.5">
                    {employee.designation}
                </p>

                {/* Badges */}
                <div className="flex items-center gap-1.5 mt-3">
                    <EmployeeStatusBadge status={employee.status} />
                    <span className="capitalize text-[9px] font-bold text-foreground bg-muted border border-border px-1.5 py-0.5 rounded">
                        {employee.role}
                    </span>
                </div>

                {/* Divider */}
                <div className="w-full border-t border-border/80 my-4" />

                {/* Quick Contact Info */}
                <div className="w-full space-y-1.5 text-left text-xs text-foreground/80 px-1">
                    <div className="flex items-center gap-2">
                        <Mail className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate" title={employee.email}>
                            {employee.email}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{employee.phone || "N/A"}</span>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
