"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 rounded-md" />
        <Skeleton className="h-4 w-72 rounded-md" />
      </div>

      {/* Profile Header Card Banner Skeleton */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-xs h-56">
        <div className="h-32 w-full bg-muted/60" />
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 px-6 pb-6 -mt-12">
          <Skeleton className="size-28 rounded-full border-4 border-background" />
          <div className="space-y-2 mt-4 md:mt-0 flex-1">
            <Skeleton className="h-7 w-60 rounded-md" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-4 w-24 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Header Skeleton */}
      <div className="flex gap-2 p-1 w-[400px] bg-muted/60 rounded-xl h-10 border border-border">
        <Skeleton className="flex-1 h-full rounded-lg" />
        <Skeleton className="flex-1 h-full rounded-lg" />
      </div>

      {/* Details Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Col 1: Personal Info Card Skeleton */}
        <div className="space-y-6">
          <div className="p-6 bg-card border border-border rounded-2xl space-y-6 h-72">
            <Skeleton className="h-5 w-40 rounded-md" />
            <div className="grid grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3.5 w-20 rounded-md" />
                  <Skeleton className="h-4 w-36 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Col 2: Employment Details Card Skeleton */}
        <div className="p-6 bg-card border border-border rounded-2xl space-y-6 h-72">
          <Skeleton className="h-5 w-40 rounded-md" />
          <div className="grid grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3.5 w-20 rounded-md" />
                <Skeleton className="h-4 w-36 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
