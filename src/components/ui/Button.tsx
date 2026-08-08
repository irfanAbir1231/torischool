import type { AnchorHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  variant?: "primary" | "text";
};

export function Button({ children, className, variant = "primary", ...props }: ButtonProps) {
  return (
    <a
      className={cn(
        "inline-flex min-h-11 items-center justify-center text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent",
        variant === "primary" && "bg-accent px-5 text-cream hover:bg-accent-strong",
        variant === "text" && "text-ink underline decoration-line underline-offset-4 hover:text-accent",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}
