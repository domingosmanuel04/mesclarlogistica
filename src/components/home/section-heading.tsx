import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
  centered?: boolean;
  tone?: "default" | "light";
}

export function SectionHeading({
  title,
  subtitle,
  eyebrow,
  href,
  linkLabel = "Ver todos",
  className,
  centered,
  tone = "default",
}: SectionHeadingProps) {
  const isLight = tone === "light";

  return (
    <div
      className={cn(
        "mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        centered && "items-center text-center sm:flex-col sm:items-center",
        className
      )}
    >
      <div className={cn(centered && "flex flex-col items-center")}>
        <div className={cn("mb-3 flex items-center gap-3", centered && "justify-center")}>
          <span
            className={cn(
              "h-px w-8 bg-mesclar-gold/60",
              isLight && "bg-mesclar-gold-light/50"
            )}
            aria-hidden
          />
          <p
            className={cn(
              "text-[11px] font-bold uppercase tracking-[0.22em]",
              isLight ? "text-mesclar-gold-light" : "text-mesclar-gold-dark"
            )}
          >
            {eyebrow ?? "Mesclar"}
          </p>
        </div>
        <h2
          className={cn(
            "text-2xl font-bold tracking-tight sm:text-3xl lg:text-[2rem]",
            isLight ? "text-white" : "text-mesclar-black"
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={cn(
              "mt-3 max-w-2xl text-base leading-relaxed",
              isLight ? "text-white/65" : "text-mesclar-muted",
              centered && "mx-auto"
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className={cn(
            "group inline-flex items-center gap-1.5 text-sm font-semibold transition-colors",
            isLight
              ? "text-mesclar-gold-light hover:text-white"
              : "text-mesclar-gold-dark hover:text-mesclar-black"
          )}
        >
          {linkLabel}
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
