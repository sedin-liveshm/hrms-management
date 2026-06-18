import { Building2 } from "lucide-react";

interface AuthHeaderProps {
  title: string;
  description?: string;
  showLogo?: boolean;
}

export function AuthHeader({
  title,
  description,
  showLogo = true,
}: AuthHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-2 text-center select-none">
      {showLogo && (
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary mb-2 shadow-sm transition-transform duration-300 hover:scale-105">
          <Building2
            className="size-6 text-primary-foreground"
            aria-hidden="true"
          />
        </div>
      )}
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      {description && (
        <p className="text-sm text-muted-foreground font-medium">
          {description}
        </p>
      )}
    </div>
  );
}
