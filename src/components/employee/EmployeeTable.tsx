import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTable } from "@/components/common";
import type { Column } from "@/components/common";
import { EmployeeStatusBadge } from "./EmployeeStatusBadge";
import { EmployeeActions } from "./EmployeeActions";
import type { Employee } from "@/types/employee";
import { useRouter } from "next/navigation";

interface EmployeeTableProps {
  data: Employee[];
  isLoading?: boolean;
  onEdit: (employee: Employee) => void;
  onDelete: (uid: string) => void | Promise<void>;
}

export function EmployeeTable({
  data,
  isLoading = false,
  onEdit,
  onDelete,
}: EmployeeTableProps) {
  const router = useRouter();

  const handleRowClick = (row: Employee) => {
    router.push(`/employees/${row.uid}`);
  };

  const columns: Column<Employee>[] = [
    {
      key: "employeeId",
      label: "Employee ID",
      width: "120px",
      renderCell: (row) => (
        <span className="font-mono text-xs font-semibold text-muted-foreground">
          {row.employeeId}
        </span>
      ),
    },
    {
      key: "name",
      label: "Employee",
      renderCell: (row) => {
        const initials = row.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-9 border border-border/80">
              <AvatarImage src={row.photoURL || undefined} alt={row.name} className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-foreground truncate max-w-44 leading-tight">
                {row.name}
              </span>
              <span className="text-[11px] text-muted-foreground truncate max-w-44 mt-0.5">
                {row.email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "department",
      label: "Department",
      renderCell: (row) => (
        <span className="text-sm text-foreground/80">{row.department}</span>
      ),
    },
    {
      key: "designation",
      label: "Designation",
      renderCell: (row) => (
        <span className="text-sm text-foreground/80">{row.designation}</span>
      ),
    },
    {
      key: "role",
      label: "Access Role",
      width: "110px",
      renderCell: (row) => (
        <span className="inline-flex items-center capitalize text-[10px] font-bold text-foreground bg-muted border border-border px-2 py-0.5 rounded-md">
          {row.role}
        </span>
      ),
    },
    {
      key: "managerName",
      label: "Manager",
      renderCell: (row) => (
        <span className="text-sm text-foreground/80 font-medium">
          {row.managerName || row.manager || "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "110px",
      renderCell: (row) => <EmployeeStatusBadge status={row.status} />,
    },
    {
      key: "actions",
      label: "",
      width: "60px",
      align: "right",
      renderCell: (row) => (
        // Stop click propagation so clicking action dropdown doesn't trigger row selection navigation
        <div onClick={(e) => e.stopPropagation()}>
          <EmployeeActions
            employee={row}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey="uid"
      isLoading={isLoading}
      skeletonRows={6}
      emptyTitle="No Employees Found"
      emptyDescription="Try broadening your search criteria or add a new employee profile."
      onRowClick={handleRowClick}
    />
  );
}
