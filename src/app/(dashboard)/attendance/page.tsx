"use client";

import { useState } from "react";
import { Clock, RefreshCw, Users, ShieldAlert } from "lucide-react";
import {
    PageContainer,
    PageHeader,
    SectionCard,
    ErrorState,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// Local styled Label component
const Label = (props: React.LabelHTMLAttributes<HTMLLabelElement>) => (
    <label
        {...props}
        className="text-xs text-muted-foreground uppercase font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    />
);

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/hooks/useAuth";
import { useAttendance } from "@/hooks/useAttendance";
import { AttendanceSummary } from "@/components/attendance/AttendanceSummary";
import { AttendanceFilters } from "@/components/attendance/AttendanceFilters";
import { AttendanceTable } from "@/components/attendance/AttendanceTable";
import { AttendanceStats } from "@/components/attendance/AttendanceStats";
import { AttendanceStatus, type AttendanceRecord } from "@/types/attendance";
import { toast } from "sonner";

export default function AttendancePage() {
    const { user, role } = useAuth();

    // Primary hook for personal & team logs
    const {
        attendance,
        loading,
        error,
        summary,
        todayRecord,
        filters,
        checkIn,
        checkOut,
        refresh,
        updateFilters,
        updateRecord,
    } = useAttendance();

    // Form states for Admin log management
    const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
    const [checkInTime, setCheckInTime] = useState("");
    const [checkOutTime, setCheckOutTime] = useState("");
    const [editedStatus, setEditedStatus] = useState<AttendanceStatus>(AttendanceStatus.PRESENT);
    const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

    // Dynamic date/time helpers for the editor
    const getHoursAndMinutes = (isoString: string | null) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        const h = String(date.getHours()).padStart(2, "0");
        const m = String(date.getMinutes()).padStart(2, "0");
        return `${h}:${m}`;
    };

    const updateIsoTime = (originalIsoString: string | null, dateStr: string, timeStr: string) => {
        if (!timeStr) return null;
        const [hours, minutes] = timeStr.split(":").map(Number);
        const date = new Date(originalIsoString || `${dateStr}T00:00:00`);
        date.setHours(hours, minutes, 0, 0);
        return date.toISOString();
    };

    // Open Admin Edit modal
    const handleOpenEditModal = (record: AttendanceRecord) => {
        setEditingRecord(record);
        setCheckInTime(getHoursAndMinutes(record.checkIn));
        setCheckOutTime(getHoursAndMinutes(record.checkOut));
        setEditedStatus(record.status);
    };

    // Save admin updates
    const handleSaveEdit = async () => {
        if (!editingRecord) return;
        setIsSubmittingEdit(true);
        try {
            let checkInIso = null;
            let checkOutIso = null;
            let calculatedHours = null;

            // Only calculate times if status is a working status
            if (editedStatus !== AttendanceStatus.ABSENT && editedStatus !== AttendanceStatus.LEAVE) {
                const defaultCheckIn = new Date(`${editingRecord.date}T09:00:00`);
                const defaultCheckOut = new Date(`${editingRecord.date}T18:00:00`);

                checkInIso = checkInTime
                    ? updateIsoTime(editingRecord.checkIn, editingRecord.date, checkInTime)
                    : defaultCheckIn.toISOString();

                checkOutIso = checkOutTime
                    ? updateIsoTime(editingRecord.checkOut, editingRecord.date, checkOutTime)
                    : defaultCheckOut.toISOString();

                if (checkInIso && checkOutIso) {
                    const diff = new Date(checkOutIso).getTime() - new Date(checkInIso).getTime();
                    calculatedHours = Math.max(0, Math.round((diff / (1000 * 60 * 60)) * 100) / 100);
                }
            }

            await updateRecord(editingRecord.id, {
                status: editedStatus,
                checkIn: checkInIso,
                checkOut: checkOutIso,
                totalHours: calculatedHours,
            });

            setEditingRecord(null);
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsSubmittingEdit(false);
        }
    };

    const isPrivilegedUser = role === "admin" || role === "hr" || role === "manager";

    return (
        <PageContainer>
            <PageHeader
                title="Attendance Management"
                subtitle="Log working hours, view calendars, and track directory logs"
                action={
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={refresh}
                            disabled={loading}
                            className="h-9 rounded-xl cursor-pointer"
                            title="Refresh logs"
                        >
                            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
                        </Button>

                        <Badge className="bg-primary/10 text-primary border-0 rounded-md font-semibold select-none flex items-center h-7 gap-1">
                            <Clock className="size-3.5" />
                            <span>Shift: 9 AM - 6 PM</span>
                        </Badge>
                    </div>
                }
            />

            {error ? (
                <ErrorState
                    title="Failed to load attendance logs"
                    description={error}
                    onRetry={refresh}
                />
            ) : isPrivilegedUser ? (
                // Managers, HR, Admins get a split Tab interface
                <Tabs defaultValue="team" className="w-full flex flex-col gap-6">
                    <TabsList className="bg-muted/30 p-1 rounded-xl self-start border border-border/40">
                        <TabsTrigger value="team" className="rounded-lg font-semibold text-xs py-1.5 px-3 cursor-pointer">
                            Team Attendance
                        </TabsTrigger>
                        <TabsTrigger value="personal" className="rounded-lg font-semibold text-xs py-1.5 px-3 cursor-pointer">
                            My Attendance
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab Content: Team Attendance View */}
                    <TabsContent value="team" className="flex flex-col gap-6 outline-none">
                        {/* Filterstrip */}
                        <AttendanceFilters
                            filters={filters}
                            onFilterChange={updateFilters}
                            showEmployeeFilter={true}
                        />

                        {/* Team Stats */}
                        <AttendanceStats summary={summary} isLoading={loading} />

                        {/* Team Table Log */}
                        <SectionCard
                            title="Team Attendance Log"
                            description="Real-time employee check-in/out records"
                            noPadding
                            action={
                                <Badge className="bg-primary/10 text-primary border-0 font-bold">
                                    <Users className="mr-1.5 size-3.5" />
                                    {attendance.length} Records Found
                                </Badge>
                            }
                        >
                            <AttendanceTable
                                data={attendance}
                                isLoading={loading}
                                showEmployeeColumn={true}
                                isAdmin={role === "admin"}
                                onEditClick={handleOpenEditModal}
                            />
                        </SectionCard>
                    </TabsContent>

                    {/* Tab Content: Personal Attendance View */}
                    <TabsContent value="personal" className="outline-none">
                        <AttendanceSummary
                            attendance={attendance}
                            summary={summary}
                            todayRecord={todayRecord}
                            onCheckIn={checkIn}
                            onCheckOut={checkOut}
                            isLoading={loading}
                            isMutating={loading}
                            isAdmin={role === "admin"}
                            onEditClick={handleOpenEditModal}
                        />
                    </TabsContent>
                </Tabs>
            ) : (
                // Standard Employees only see their own summary
                <AttendanceSummary
                    attendance={attendance}
                    summary={summary}
                    todayRecord={todayRecord}
                    onCheckIn={checkIn}
                    onCheckOut={checkOut}
                    isLoading={loading}
                    isMutating={loading}
                    isAdmin={false}
                />
            )}

            {/* Admin Record Editor Modal */}
            {editingRecord && (
                <Dialog open={!!editingRecord} onOpenChange={() => setEditingRecord(null)}>
                    <DialogContent className="max-w-md rounded-2xl border-border bg-card text-card-foreground shadow-lg">
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                                <ShieldAlert className="size-5 text-primary" />
                                Manage Attendance Record
                            </DialogTitle>
                        </DialogHeader>

                        <div className="flex flex-col gap-4 py-4">
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs text-muted-foreground uppercase font-bold">Employee</Label>
                                <div className="text-sm font-semibold border-b border-border/40 pb-2">
                                    {editingRecord.employeeName} ({editingRecord.employeeId})
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs text-muted-foreground uppercase font-bold">Date</Label>
                                <div className="text-sm font-semibold border-b border-border/40 pb-2">
                                    {new Date(editingRecord.date).toLocaleDateString("en-IN", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="edit-status" className="text-xs text-muted-foreground uppercase font-bold">
                                    Status
                                </Label>
                                <Select
                                    value={editedStatus}
                                    onValueChange={(val) => setEditedStatus(val as AttendanceStatus)}
                                >
                                    <SelectTrigger id="edit-status" className="h-9 rounded-xl border-border">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(AttendanceStatus).map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {status}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {editedStatus !== AttendanceStatus.ABSENT && editedStatus !== AttendanceStatus.LEAVE && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="edit-checkin" className="text-xs text-muted-foreground uppercase font-bold">
                                            Check In Time
                                        </Label>
                                        <Input
                                            id="edit-checkin"
                                            type="time"
                                            value={checkInTime}
                                            onChange={(e) => setCheckInTime(e.target.value)}
                                            className="h-9 rounded-xl border-border"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="edit-checkout" className="text-xs text-muted-foreground uppercase font-bold">
                                            Check Out Time
                                        </Label>
                                        <Input
                                            id="edit-checkout"
                                            type="time"
                                            value={checkOutTime}
                                            onChange={(e) => setCheckOutTime(e.target.value)}
                                            className="h-9 rounded-xl border-border"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/40">
                            <Button
                                variant="outline"
                                onClick={() => setEditingRecord(null)}
                                disabled={isSubmittingEdit}
                                className="h-9 rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveEdit}
                                disabled={isSubmittingEdit}
                                className="bg-primary text-primary-foreground font-semibold h-9 rounded-xl hover:bg-primary/95"
                            >
                                {isSubmittingEdit ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </PageContainer>
    );
}
