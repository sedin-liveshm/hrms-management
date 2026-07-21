"use client";

import React from "react";
import { PageContainer, PageHeader, EmptyState } from "@/components/common";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { useProfile } from "@/hooks/useProfile";
import ProfileLoading from "./loading";
import { UserX } from "lucide-react";

export default function ProfilePage() {
  const {
    profile,
    loading,
    updating,
    updateProfile,
    uploadImage,
    removeImage,
    changePassword,
  } = useProfile();

  if (loading && !profile) {
    return (
      <PageContainer>
        <ProfileLoading />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="My Profile"
          subtitle="Manage your personal information, avatar, and security settings"
        />

        {!profile ? (
          <EmptyState
            icon={UserX}
            title="Profile Not Found"
            description="Your user profile details could not be retrieved from the database. Please try logging in again."
          />
        ) : (
          <div className="space-y-6">
            {/* Header Banner & Photo Upload Section */}
            <ProfileHeader
              profile={profile}
              onUploadImage={uploadImage}
              onRemoveImage={removeImage}
              isUploading={updating}
            />

            {/* Profile Info Details & Password Security Tabs */}
            <ProfileTabs
              profile={profile}
              onUpdateProfile={updateProfile}
              onUpdatePassword={changePassword}
              isUpdating={updating}
            />
          </div>
        )}
      </div>
    </PageContainer>
  );
}
