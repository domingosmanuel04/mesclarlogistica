import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "gold" | "success" | "danger";

type IconComponent = LucideIcon | React.ComponentType<{ className?: string }>;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  leftIcon?: IconComponent;
  rightIcon?: IconComponent;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-mesclar-black text-white shadow-sm hover:bg-mesclar-gray active:scale-[0.98] border border-transparent dark:bg-gradient-to-b dark:from-mesclar-gold-light dark:to-mesclar-gold dark:text-mesclar-black dark:font-semibold dark:hover:from-[#edd978] dark:hover:to-mesclar-gold-light",
  secondary:
    "bg-white text-mesclar-black border border-mesclar-border shadow-sm hover:border-mesclar-gold/50 hover:bg-mesclar-cream/30 active:scale-[0.98] dark:bg-mesclar-gold dark:text-mesclar-black dark:border-mesclar-gold dark:hover:bg-mesclar-gold-light dark:font-semibold",
  outline:
    "bg-transparent text-mesclar-black border border-mesclar-black/80 hover:bg-mesclar-black hover:text-white active:scale-[0.98] dark:border-mesclar-gold dark:text-mesclar-gold dark:hover:bg-mesclar-gold dark:hover:text-mesclar-black",
  ghost:
    "bg-transparent text-mesclar-gray hover:bg-black/[0.04] active:scale-[0.98] dark:text-white dark:hover:bg-[#1e3a5f]",
  gold:
    "bg-gradient-to-b from-mesclar-gold-light to-mesclar-gold text-mesclar-black font-semibold shadow-[0_2px_12px_-2px_rgba(201,162,39,0.55)] hover:from-[#edd978] hover:to-mesclar-gold-light border border-mesclar-gold-dark/25 active:scale-[0.98]",
  success:
    "bg-[#16a34a] text-white font-semibold shadow-[0_2px_12px_-2px_rgba(22,163,74,0.45)] hover:bg-[#15803d] border border-[#15803d]/30 active:scale-[0.98]",
  danger:
    "bg-rose-600 text-white font-semibold shadow-[0_2px_12px_-2px_rgba(225,29,72,0.45)] hover:bg-rose-700 border border-rose-700/30 active:scale-[0.98]",
};

const sizes = {
  sm: "px-3.5 py-2 text-xs rounded-lg gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-7 py-3.5 text-base rounded-xl gap-2",
};

const iconSizes = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      children,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {LeftIcon && <LeftIcon className={cn(iconSizes[size], "shrink-0")} aria-hidden />}
      {children}
      {RightIcon && <RightIcon className={cn(iconSizes[size], "shrink-0")} aria-hidden />}
    </button>
  )
);
Button.displayName = "Button";
