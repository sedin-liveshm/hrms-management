import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { ConfirmDialog } from "@/components/common";
import type { Employee } from "@/types/employee";

interface EmployeeActionsProps {
    employee: Employee;
    onEdit: (employee: Employee) => void;
    onDelete: (uid: string) => void | Promise<void>;
}

export function EmployeeActions({
    employee,
    onEdit,
    onDelete,
}: EmployeeActionsProps) {
    const router = useRouter();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex size-8 items-center justify-center rounded-lg p-0 cursor-pointer hover:bg-muted/80 text-muted-foreground hover:text-foreground focus-visible:outline-hidden">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                {/* View Details — Accessible to all authorized roles (admin, hr, manager) */}
                <DropdownMenuItem
                    onClick={() => router.push(`/employees/${employee.uid}`)}
                    className="cursor-pointer"
                >
                    <Eye className="mr-2 size-4 text-muted-foreground" />
                    <span>View Details</span>
                </DropdownMenuItem>

                {/* Edit Employee — RoleGuard for Admin and HR only */}
                <RoleGuard roles={["admin", "hr"]}>
                    <DropdownMenuItem
                        onClick={() => onEdit(employee)}
                        className="cursor-pointer"
                    >
                        <Pencil className="mr-2 size-4 text-muted-foreground" />
                        <span>Edit Employee</span>
                    </DropdownMenuItem>
                </RoleGuard>

                {/* Delete / Deactivate Employee — RoleGuard for Admin only */}
                <RoleGuard roles={["admin"]}>
                    <ConfirmDialog
                        variant="destructive"
                        title="Deactivate Employee"
                        description={`Are you sure you want to deactivate ${employee.name}? This will soft-delete them by setting their status to Inactive.`}
                        confirmLabel="Deactivate"
                        onConfirm={() => onDelete(employee.uid)}
                        trigger={
                            <div
                                role="menuitem"
                                tabIndex={0}
                                className="flex w-full items-center px-2 py-1.5 text-sm cursor-pointer rounded-sm hover:bg-destructive/10 text-destructive focus:text-destructive transition-colors select-none"
                            >
                                <Trash2 className="mr-2 size-4 text-destructive" />
                                <span>Deactivate</span>
                            </div>
                        }
                    />
                </RoleGuard>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
