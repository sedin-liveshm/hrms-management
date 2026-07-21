"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProfileDetails } from "./ProfileDetails";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { User, Shield } from "lucide-react";
import type { UserProfile } from "@/types/profile";

interface ProfileTabsProps {
  profile: UserProfile | null;
  onUpdateProfile: (data: Partial<UserProfile>) => Promise<void>;
  onUpdatePassword: (currentPass: string, newPass: string) => Promise<void>;
  isUpdating: boolean;
}

export function ProfileTabs({
  profile,
  onUpdateProfile,
  onUpdatePassword,
  isUpdating,
}: ProfileTabsProps) {
  return (
    <Tabs defaultValue="details" className="w-full space-y-6">
      <TabsList className="grid w-full sm:w-[400px] grid-cols-2 rounded-xl bg-muted p-1 border border-border">
        <TabsTrigger
          value="details"
          className="gap-2 rounded-lg py-2 font-bold cursor-pointer transition-all focus-visible:outline-hidden data-[state=active]:bg-background data-[state=active]:text-foreground"
        >
          <User className="size-4" />
          Profile Details
        </TabsTrigger>
        <TabsTrigger
          value="security"
          className="gap-2 rounded-lg py-2 font-bold cursor-pointer transition-all focus-visible:outline-hidden data-[state=active]:bg-background data-[state=active]:text-foreground"
        >
          <Shield className="size-4" />
          Security Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="focus-visible:outline-hidden space-y-6">
        <ProfileDetails
          profile={profile}
          onUpdateProfile={onUpdateProfile}
          isUpdating={isUpdating}
        />
      </TabsContent>

      <TabsContent value="security" className="focus-visible:outline-hidden space-y-6">
        <ChangePasswordForm
          onSubmit={onUpdatePassword}
          isSubmitting={isUpdating}
        />
      </TabsContent>
    </Tabs>
  );
}
