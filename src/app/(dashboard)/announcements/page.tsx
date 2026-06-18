import type { Metadata } from "next";
import { Megaphone, Plus } from "lucide-react";
import { PageContainer, PageHeader, SectionCard, EmptyState } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const metadata: Metadata = { title: "Announcements" };

const announcements = [
  {
    id: "1",
    title: "Office Closure — Republic Day",
    content: "The office will remain closed on January 26th in observance of Republic Day. All employees should plan accordingly.",
    author: "HR Team",
    date: "2026-06-08",
    category: "Holiday",
    pinned: true,
  },
  {
    id: "2",
    title: "Annual Performance Review — June 2026",
    content: "The annual performance review cycle begins June 15th. Managers are requested to schedule 1:1 sessions with their direct reports.",
    author: "Sneha Patel",
    date: "2026-06-05",
    category: "HR Policy",
    pinned: false,
  },
  {
    id: "3",
    title: "New Health Insurance Benefits",
    content: "We are pleased to announce enhanced health insurance coverage starting July 2026. Details have been sent to your email.",
    author: "HR Team",
    date: "2026-06-01",
    category: "Benefits",
    pinned: false,
  },
];

const categoryColors: Record<string, string> = {
  Holiday: "bg-primary/10 text-primary border-0",
  "HR Policy": "bg-secondary/10 text-secondary border-0",
  Benefits: "bg-amber-50 text-amber-600 border-0",
};

export default function AnnouncementsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Announcements"
        subtitle="Company-wide updates and communications"
        action={
          <Button size="sm" className="gap-1.5">
            <Plus className="size-4" />
            New Announcement
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        {announcements.map((ann) => (
          <SectionCard
            key={ann.id}
            title={ann.title}
            action={
              <div className="flex items-center gap-2">
                {ann.pinned && (
                  <Badge className="bg-primary/10 text-primary border-0 text-[10px]">
                    📌 Pinned
                  </Badge>
                )}
                <Badge className={categoryColors[ann.category] ?? "bg-muted text-foreground border-0"}>
                  {ann.category}
                </Badge>
              </div>
            }
          >
            <p className="mb-4 text-sm text-muted-foreground">{ann.content}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Avatar className="size-5">
                <AvatarFallback className="bg-secondary/10 text-[8px] text-secondary">
                  {ann.author.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <span>{ann.author}</span>
              <span>·</span>
              <span>{ann.date}</span>
            </div>
          </SectionCard>
        ))}
      </div>
    </PageContainer>
  );
}
