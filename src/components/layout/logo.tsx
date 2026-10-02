import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
}

export function Logo({ className, variant = "dark" }: LogoProps) {
  const isLight = variant === "light";
  return (
    <Link href="/" className={cn("group flex items-center gap-3", className)}>
      <span
        className={cn(
          "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border p-1.5 transition-colors overflow-hidden",
          isLight
            ? "border-mesclar-gold/40 bg-white/10"
            : "border-mesclar-gold/30 bg-white shadow-sm group-hover:border-mesclar-gold/60"
        )}
        aria-hidden
      >
        <Image
          src="/icon.png"
          alt="Mesclar Logística"
          width={32}
          height={32}
          className="h-full w-full object-contain"
          priority
        />
      </span>
      <span className="leading-tight">
        <span
          className={cn(
            "block text-base font-extrabold tracking-[0.16em] uppercase",
            isLight ? "text-white" : "text-mesclar-black"
          )}
        >
          Mesclar
        </span>
        <span
          className={cn(
            "mt-0.5 block text-[9px] font-semibold tracking-[0.14em] uppercase",
            isLight ? "text-mesclar-gold-light" : "text-mesclar-gold-dark"
          )}
        >
          Logística <span className={isLight ? "text-white/50" : "text-mesclar-muted"}>|</span>{" "}
          Procurement
        </span>
      </span>
    </Link>
  );
}
