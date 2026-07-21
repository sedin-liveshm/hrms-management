"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEAVE_TYPE_LABELS, type LeaveRequest, type LeaveType } from "@/types/leave";
import { leaveService } from "@/services/leave.service";
import { useAuth } from "@/hooks/useAuth";
import { employeeService } from "@/services/employee.service";
import type { Employee } from "@/types/employee";

interface LeaveFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<any>;
}

// Zod Validation Schema
const leaveFormSchema = z
  .object({
    leaveType: z.enum(["casual", "sick", "earned", "maternity", "paternity", "compOff", "lop", "wfh"] as const),
    startDate: z.string().min(1, "Start date is required."),
    endDate: z.string().min(1, "End date is required."),
    halfDay: z.boolean().default(false),
    reason: z.string().min(5, "Reason must be at least 5 characters."),
    emergencyContact: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(data.startDate);
      start.setHours(0, 0, 0, 0);
      return start >= today;
    },
    {
      message: "Start date cannot be in the past.",
      path: ["startDate"],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return start <= end;
    },
    {
      message: "End date must be after or equal to start date.",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      if (data.halfDay) {
        return data.startDate === data.endDate;
      }
      return true;
    },
    {
      message: "Half day leave must start and end on the same day.",
      path: ["endDate"],
    }
  );

type LeaveFormValues = z.infer<typeof leaveFormSchema>;

export function LeaveForm({ isOpen, onClose, onSubmit }: LeaveFormProps) {
  const { user } = useAuth();
  const [managerInfo, setManagerInfo] = useState<{ id: string; name: string } | null>(null);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveFormSchema) as any,
    defaultValues: {
      leaveType: "sick",
      startDate: leaveService.getLocalDateString(new Date()),
      endDate: leaveService.getLocalDateString(new Date()),
      halfDay: false,
      reason: "",
      emergencyContact: "",
    },
  });

  const leaveTypeValue = watch("leaveType");
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const halfDay = watch("halfDay");

  // Dynamically fetch and display direct manager details
  useEffect(() => {
    async function loadManager() {
      if (user?.uid) {
        try {
          const emp = await employeeService.getEmployeeById(user.uid);
          if (emp?.manager) {
            // Find manager details
            const allEmps = await employeeService.getAllEmployees();
            const mgr = allEmps.find((e) => e.employeeId === emp.manager || e.uid === emp.manager || e.name === emp.manager);
            if (mgr) {
              setManagerInfo({ id: mgr.uid!, name: mgr.name });
            } else {
              setManagerInfo({ id: "mock-uid-manager", name: emp.manager || "Project Manager" });
            }
          } else {
            // Fallback manager
            setManagerInfo({ id: "mock-uid-manager", name: "Project Manager" });
          }
        } catch (e) {
          console.error("Failed to load manager details:", e);
        }
      }
    }
    loadManager();
  }, [user]);

  // Sync end date if halfDay is checked
  useEffect(() => {
    if (halfDay && startDate) {
      setValue("endDate", startDate);
    }
  }, [halfDay, startDate, setValue]);

  // Calculate live days count
  let computedDays = 0;
  if (halfDay) {
    computedDays = 0.5;
  } else if (startDate && endDate) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (s <= e) {
      computedDays = leaveService.calculateTotalDays(s, e, false);
    }
  }

  const handleFormSubmit = async (data: LeaveFormValues) => {
    if (!user) return;
    
    // Enrich request with employee details
    const submission = {
      uid: user.uid,
      employeeId: user.employeeId || "EMP-USER-0000",
      employeeName: user.name || user.displayName || "Employee",
      employeeEmail: user.email || "",
      department: user.department || "Engineering",
      designation: user.designation || "Software Engineer",
      managerId: managerInfo?.id || "mock-uid-manager",
      managerName: managerInfo?.name || "Project Manager",
      leaveType: data.leaveType,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      totalDays: computedDays,
      halfDay: data.halfDay,
      reason: data.reason,
      emergencyContact: data.emergencyContact || undefined,
    };

    try {
      await onSubmit(submission);
      reset();
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for Leave</DialogTitle>
          <DialogDescription className="text-xs">
            Submit a leave request. This will route to your manager for approval.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          {/* Leave Type Select */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Leave Type</label>
            <Select
              value={leaveTypeValue}
              onValueChange={(val) => setValue("leaveType", val as LeaveType)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type of leave" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.leaveType && (
              <p className="text-[11px] text-destructive font-medium">{errors.leaveType.message}</p>
            )}
          </div>

          {/* Half Day Toggle */}
          <div className="flex items-center gap-2 rounded-xl border border-border p-3">
            <input
              type="checkbox"
              id="halfDay"
              {...register("halfDay")}
              disabled={isSubmitting}
              className="size-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            <div className="grid gap-0.5 leading-none">
              <label htmlFor="halfDay" className="text-xs font-semibold text-foreground cursor-pointer select-none">
                Half Day Leave
              </label>
              <p className="text-[10px] text-muted-foreground">
                Applies as a 0.5 day deduction for the selected start date.
              </p>
            </div>
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="start-date" className="text-xs font-semibold text-muted-foreground">Start Date</label>
              <div className="relative flex items-center">
                <Input
                  id="start-date"
                  type="date"
                  {...register("startDate")}
                  className="pl-8 text-xs"
                  disabled={isSubmitting}
                />
                <Calendar className="absolute left-2.5 size-4 text-muted-foreground pointer-events-none" />
              </div>
              {errors.startDate && (
                <p className="text-[11px] text-destructive font-medium">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="end-date" className="text-xs font-semibold text-muted-foreground">End Date</label>
              <div className="relative flex items-center">
                <Input
                  id="end-date"
                  type="date"
                  {...register("endDate")}
                  className="pl-8 text-xs"
                  disabled={isSubmitting || halfDay}
                />
                <Calendar className="absolute left-2.5 size-4 text-muted-foreground pointer-events-none" />
              </div>
              {errors.endDate && (
                <p className="text-[11px] text-destructive font-medium">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Live Duration Summary badge */}
          {computedDays > 0 && (
            <div className="flex items-center justify-between rounded-xl bg-primary/10 border border-primary/20 px-4 py-2.5 text-xs text-primary">
              <span className="font-medium">Calculated Leave Duration:</span>
              <span className="font-bold text-sm">
                {computedDays} Day{computedDays > 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Reason for Leave */}
          <div className="space-y-1">
            <label htmlFor="reason" className="text-xs font-semibold text-muted-foreground">Reason for Leave</label>
            <Textarea
              id="reason"
              placeholder="Provide a detailed reason for your leave request..."
              {...register("reason")}
              className="text-xs"
              disabled={isSubmitting}
              rows={3}
            />
            {errors.reason && (
              <p className="text-[11px] text-destructive font-medium">{errors.reason.message}</p>
            )}
          </div>

          {/* Emergency Contact */}
          <div className="space-y-1">
            <label htmlFor="emergency-contact" className="text-xs font-semibold text-muted-foreground">Emergency Contact (Optional)</label>
            <Input
              id="emergency-contact"
              type="text"
              placeholder="e.g. Phone number or family contact"
              {...register("emergencyContact")}
              className="text-xs"
              disabled={isSubmitting}
            />
            {errors.emergencyContact && (
              <p className="text-[11px] text-destructive font-medium">{errors.emergencyContact.message}</p>
            )}
          </div>

          {/* Approver Detail (Read-Only Info) */}
          {managerInfo && (
            <div className="rounded-xl bg-muted/60 p-3 text-[11px] text-muted-foreground border border-border/40">
              <span className="font-semibold text-foreground">Workflow Approver:</span> Direct manager **{managerInfo.name}**
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isSubmitting} className="text-xs">
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground text-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-3.5 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default LeaveForm;
