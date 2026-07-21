import type { Metadata } from "next";
import { PageContainer } from "@/components/common";
import { AnnouncementFeed } from "@/components/announcements/AnnouncementFeed";

export const metadata: Metadata = { title: "Announcements" };

export default function AnnouncementsPage() {
    return (
        <PageContainer>
            <AnnouncementFeed />
        </PageContainer>
    );
}



