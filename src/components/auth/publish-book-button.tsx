"use client";

import { useRouter } from "next/navigation";
import { BookPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

/**
 * Public CTA: sends the user to the seller panel (where publishing lives).
 */
export function PublishBookButton({
  size = "sm",
  className,
  fullWidth,
  variant = "gold",
  label = "Publicar meu livro",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
  fullWidth?: boolean;
  variant?: "gold" | "outline";
  label?: string;
}) {
  const { isAuthenticated, becomeSeller } = useAuth();
  const router = useRouter();

  async function handleClick() {
    if (!isAuthenticated) {
      router.push(
        `/entrar?redirect=${encodeURIComponent("/profissional")}&msg=${encodeURIComponent(
          "Entre na sua conta para aceder ao painel profissional e publicar livros."
        )}`
      );
      return;
    }
    await becomeSeller();
    router.push("/profissional");
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      leftIcon={BookPlus}
      className={cn(fullWidth && "w-full", className)}
      onClick={handleClick}
    >
      {label}
    </Button>
  );
}
