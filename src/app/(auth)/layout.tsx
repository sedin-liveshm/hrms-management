
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | HRMS",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      {/* Subtle decorative background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-30"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 20% 50%, color-mix(in srgb, var(--primary) 15%, transparent) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, color-mix(in srgb, var(--secondary) 10%, transparent) 0%, transparent 60%)",
        }}
      />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
