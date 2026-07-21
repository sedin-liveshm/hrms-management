"use client";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";
import { LeaveStatusBadge } from "./LeaveStatusBadge";
import { LEAVE_TYPE_LABELS, type LeaveRequest } from "@/types/leave";
import { format } from "date-fns";
import { Calendar, User, Clock, FileText, CheckCircle2, AlertTriangle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface LeaveDetailsDrawerProps {
    leave: LeaveRequest | null;
    isOpen: boolean;
    onClose: () => void;
    onApprove?: (leaveId: string) => void;
    onReject?: (leaveId: string) => void;
    onCancel?: (leave: LeaveRequest) => void;
}

export function LeaveDetailsDrawer({
    leave,
    isOpen,
    onClose,
    onApprove,
    onReject,
    onCancel,
}: LeaveDetailsDrawerProps) {
    const { user, role } = useAuth();
    if (!leave) return null;

    // Format timestamp dates safely
    const toDate = (ts: any): Date => {
        if (!ts) return new Date();
        if (ts instanceof Date) return ts;
        if (typeof ts.toDate === "function") return ts.toDate();
        if (typeof ts.seconds === "number") return new Date(ts.seconds * 1000);
        return new Date(ts);
    };

    const startDate = toDate(leave.startDate);
    const endDate = toDate(leave.endDate);
    const createdAt = toDate(leave.createdAt);
    const approvedAt = leave.approvedAt ? toDate(leave.approvedAt) : null;

    const isRequester = user?.uid === leave.uid;
    const isManagerOrHR = role === "manager" || role === "hr" || role === "admin";
    const isAllowedManager = role !== "manager" || (leave.managerId ? (leave.managerId === user?.employeeId || leave.managerId === user?.uid) : false);
    const canApproveReject = isManagerOrHR && leave.status === "pending" && !isRequester && isAllowedManager;
    const canCancel = isRequester && leave.status === "pending";

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto" side="right">
                <SheetHeader className="border-b border-border pb-4">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-lg font-bold">Leave Details</SheetTitle>
                        <LeaveStatusBadge status={leave.status} />
                    </div>
                    <SheetDescription className="text-xs">
                        Applied on {format(createdAt, "PPP 'at' hh:mm a")}
                    </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-6 py-6">
                    {/* Employee Section */}
                    <div className="space-y-3">
                        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <User className="size-4 text-muted-foreground" />
                            Employee Information
                        </h3>
                        <div className="rounded-xl border border-border bg-card/50 p-4">
                            <p className="font-semibold text-foreground text-sm">{leave.employeeName}</p>
                            <p className="text-xs text-muted-foreground">{leave.designation} · {leave.department}</p>
                            <p className="mt-1 text-[11px] text-muted-foreground/80">ID: {leave.employeeId} · {leave.employeeEmail}</p>
                        </div>
                    </div>

                    {/* Leave Schedule Section */}
                    <div className="space-y-3">
                        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <Calendar className="size-4 text-muted-foreground" />
                            Leave Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-card/50 p-4 text-xs">
                            <div>
                                <p className="text-muted-foreground">Leave Type</p>
                                <p className="font-medium text-foreground mt-0.5">{LEAVE_TYPE_LABELS[leave.leaveType]}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Duration</p>
                                <p className="font-medium text-foreground mt-0.5">
                                    {leave.totalDays} Day{leave.totalDays > 1 ? "s" : ""}
                                    {leave.halfDay && " (Half Day)"}
                                </p>
                            </div>
                            <div className="col-span-2 border-t border-border/60 pt-3 flex justify-between">
                                <div>
                                    <p className="text-muted-foreground">Start Date</p>
                                    <p className="font-medium text-foreground mt-0.5">{format(startDate, "PPP")}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-muted-foreground">End Date</p>
                                    <p className="font-medium text-foreground mt-0.5">{format(endDate, "PPP")}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reason Section */}
                    <div className="space-y-3">
                        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <FileText className="size-4 text-muted-foreground" />
                            Reason for Leave
                        </h3>
                        <div className="rounded-xl border border-border bg-card/50 p-4">
                            <p className="text-sm text-foreground leading-relaxed italic">
                                "{leave.reason}"
                            </p>
                            {leave.emergencyContact && (
                                <p className="mt-3 text-xs text-muted-foreground border-t border-border/60 pt-2">
                                    <strong className="font-medium text-foreground">Emergency Contact:</strong> {leave.emergencyContact}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Rejection / Approval History */}
                    {leave.status !== "pending" && (
                        <div className="space-y-3">
                            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <Clock className="size-4 text-muted-foreground" />
                                Workflow Actions
                            </h3>
                            <div className="rounded-xl border border-border bg-card/50 p-4 space-y-4">
                                <div className="flex items-start gap-2.5">
                                    <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                                    <div className="text-xs">
                                        <p className="font-medium text-foreground capitalize">Status: {leave.status}</p>
                                        <p className="text-muted-foreground mt-0.5">
                                            {leave.status === "cancelled" ? (
                                                "Cancelled by Employee"
                                            ) : (
                                                <>
                                                    By {leave.approvedByName} on {approvedAt ? format(approvedAt, "PPP") : ""}
                                                </>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {leave.status === "rejected" && leave.rejectionReason && (
                                    <div className="flex items-start gap-2.5 rounded-lg bg-destructive/5 border border-destructive/10 p-3 text-xs">
                                        <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-destructive">Rejection Reason</p>
                                            <p className="text-foreground mt-1 font-medium">{leave.rejectionReason}</p>
                                        </div>
                                    </div>
                                )}

                                {leave.comments && (
                                    <div className="flex items-start gap-2.5 border-t border-border/60 pt-3 text-xs">
                                        <MessageSquare className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-muted-foreground">Manager Comments</p>
                                            <p className="text-foreground mt-1">{leave.comments}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {(canApproveReject || canCancel) && (
                    <SheetFooter className="border-t border-border pt-4 mt-auto">
                        {canApproveReject && (
                            <div className="flex items-center gap-3 w-full">
                                <Button
                                    variant="destructive"
                                    className="flex-1 text-xs"
                                    onClick={() => {
                                        onReject?.(leave.id);
                                        onClose();
                                    }}
                                >
                                    Reject
                                </Button>
                                <Button
                                    variant="default"
                                    className="flex-1 bg-primary text-primary-foreground text-xs"
                                    onClick={() => {
                                        onApprove?.(leave.id);
                                        onClose();
                                    }}
                                >
                                    Approve
                                </Button>
                            </div>
                        )}

                        {canCancel && (
                            <Button
                                variant="outline"
                                className="w-full text-xs text-destructive hover:bg-destructive/5 hover:text-destructive"
                                onClick={() => {
                                    onCancel?.(leave);
                                    onClose();
                                }}
                            >
                                Cancel Leave Request
                            </Button>
                        )}
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
}

export default LeaveDetailsDrawer;
