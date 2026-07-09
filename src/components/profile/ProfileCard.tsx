"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileCardProps {
  title: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ProfileCard({
  title,
  icon: Icon,
  action,
  children,
  className,
}: ProfileCardProps) {
  return (
    <Card className={cn("border border-border bg-card shadow-xs rounded-2xl", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border">
        <CardTitle className="text-base font-bold text-foreground flex items-center gap-2 select-none">
          {Icon && <Icon className="size-4 text-primary" />}
          {title}
        </CardTitle>
        {action && <div className="flex items-center">{action}</div>}
      </CardHeader>
      <CardContent className="pt-5">
        {children}
      </CardContent>
    </Card>
  );
}
