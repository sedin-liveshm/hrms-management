"use client";
import { ErrorState } from "@/components/common";
import { PageContainer } from "@/components/common";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorPageProps) {
  return (
    <PageContainer>
      <ErrorState
        title="Page failed to load"
        description={error.message || "An unexpected error occurred while loading this page."}
        onRetry={reset}
      />
    </PageContainer>
  );
}
