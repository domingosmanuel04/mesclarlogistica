import { cn } from "@/lib/utils";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  centered?: boolean;
}

export function PageHero({
  eyebrow,
  title,
  description,
  className,
  centered = true,
}: PageHeroProps) {
  return (
    <header
      className={cn(
        "relative overflow-hidden border-b border-mesclar-border/80 bg-mesclar-surface/80 px-4 py-14 backdrop-blur-sm lg:px-8 lg:py-16",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-40" aria-hidden />
      <div
        className={cn(
          "relative mx-auto max-w-7xl",
          centered && "text-center"
        )}
      >
        {eyebrow && (
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-mesclar-gold-dark">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-mesclar-black lg:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mesclar-muted">
            {description}
          </p>
        )}
      </div>
    </header>
  );
}
