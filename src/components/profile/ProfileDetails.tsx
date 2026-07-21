"use client";

import React, { useState } from "react";
import { ProfileCard } from "./ProfileCard";
import { EditProfileForm } from "./EditProfileForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, ShieldAlert, Sparkles, Pencil, Calendar, Mail, Phone, HeartPulse } from "lucide-react";
import type { UserProfile } from "@/types/profile";

interface ProfileDetailsProps {
  profile: UserProfile | null;
  onUpdateProfile: (data: Partial<UserProfile>) => Promise<void>;
  isUpdating: boolean;
}

export function ProfileDetails({
  profile,
  onUpdateProfile,
  isUpdating,
}: ProfileDetailsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!profile) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadgeStyle = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "inactive":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "on-leave":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200";
      default:
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Edit Profile Form Dialog Modal */}
      {isEditOpen && (
        <EditProfileForm
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          profile={profile}
          onSubmit={onUpdateProfile}
          isSubmitting={isUpdating}
        />
      )}

      {/* Column 1: Personal Information */}
      <div className="space-y-6">
        <ProfileCard
          title="Personal Information"
          icon={User}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="h-8 gap-1.5 text-xs rounded-xl cursor-pointer hover:bg-muted"
            >
              <Pencil className="size-3.5" />
              Edit Profile
            </Button>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <User className="size-3.5" /> Full Name
              </span>
              <p className="text-sm font-medium text-foreground">
                {profile.name || profile.displayName || "-"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Mail className="size-3.5" /> Corporate Email
              </span>
              <p className="text-sm font-medium text-foreground">{profile.email || "-"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Phone className="size-3.5" /> Mobile Number
              </span>
              <p className="text-sm font-medium text-foreground">{profile.phone || "-"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <HeartPulse className="size-3.5" /> Gender
              </span>
              <p className="text-sm font-medium text-foreground capitalize">
                {profile.gender || "-"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Calendar className="size-3.5" /> Date of Birth
              </span>
              <p className="text-sm font-medium text-foreground">
                {formatDate(profile.dateOfBirth)}
              </p>
            </div>
          </div>
        </ProfileCard>

        {/* Account Details Card */}
        <ProfileCard title="Account Settings" icon={ShieldAlert}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground">Account Status</span>
              <div>
                <Badge
                  variant="outline"
                  className={`capitalize select-none rounded-lg px-2.5 py-0.5 font-semibold ${getStatusBadgeStyle(
                    profile.status
                  )}`}
                >
                  {profile.status || "active"}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground">Email Status</span>
              <div>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 rounded-lg px-2.5 py-0.5 font-semibold select-none"
                >
                  Verified
                </Badge>
              </div>
            </div>
          </div>
        </ProfileCard>
      </div>

      {/* Column 2: Employment Details */}
      <div>
        <ProfileCard title="Employment Details" icon={Sparkles}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground">Employee ID</span>
              <p className="text-sm font-medium text-foreground">
                {profile.employeeId || "-"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground">RBAC Role</span>
              <p className="text-sm font-medium text-foreground capitalize">
                {profile.role || "-"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground">Department</span>
              <p className="text-sm font-medium text-foreground">
                {profile.department || "-"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground">Designation</span>
              <p className="text-sm font-medium text-foreground">
                {profile.designation || "-"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground">Line Manager</span>
              <p className="text-sm font-medium text-foreground">
                {profile.manager || "Not Assigned"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground">Joining Date</span>
              <p className="text-sm font-medium text-foreground">
                {formatDate(profile.joiningDate)}
              </p>
            </div>
          </div>
        </ProfileCard>
      </div>
    </div>
  );
}
