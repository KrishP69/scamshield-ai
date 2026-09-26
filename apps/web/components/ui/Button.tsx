import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none";

    const variants = {
      primary: "bg-ultramarine text-white hover:bg-ultramarine-dark active:scale-[0.98] shadow-sm",
      secondary: "bg-paper-200 text-ink dark:bg-ink-700 dark:text-paper hover:bg-paper-300 dark:hover:bg-ink-600",
      outline: "border border-ink/20 dark:border-paper/20 hover:bg-paper-200 dark:hover:bg-ink-700 text-ink dark:text-paper",
      ghost: "hover:bg-paper-200 dark:hover:bg-ink-700 text-ink dark:text-paper",
      danger: "bg-signal text-white hover:bg-signal-dark active:scale-[0.98]",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base font-semibold",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
