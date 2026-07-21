
import Link from "next/link";
import { Building2 } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary">
        <Building2 className="size-8 text-primary-foreground" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-6xl font-black tracking-tight text-foreground">404</h1>
        <h2 className="text-xl font-semibold text-foreground">Page not found</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
