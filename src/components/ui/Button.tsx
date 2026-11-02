import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "neon" | "secondary" | "outline" | "danger" | "ghost" | "success";
  size?: "sm" | "md" | "lg" | "touch";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "neon", size = "md", isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold transition-all duration-200 select-none rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gym-base disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

    const variantStyles = {
      neon: "bg-neon text-gym-base hover:bg-neon-lime hover:shadow-neon focus:ring-neon font-bold tracking-wide",
      secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 hover:text-white border border-zinc-700/60 focus:ring-zinc-500",
      outline: "bg-transparent text-zinc-200 border border-zinc-700 hover:border-neon hover:text-neon focus:ring-neon",
      danger: "bg-red-600/90 text-white hover:bg-red-500 hover:shadow-red-900/40 focus:ring-red-500",
      success: "bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-emerald-900/40 focus:ring-emerald-500",
      ghost: "bg-transparent text-zinc-300 hover:bg-zinc-800/80 hover:text-white focus:ring-zinc-600",
    };

    const sizeStyles = {
      sm: "text-xs px-2.5 py-1.5 gap-1.5 h-8",
      md: "text-sm px-4 py-2 gap-2 h-10",
      lg: "text-base px-6 py-3 gap-2.5 h-12",
      touch: "text-base px-5 py-3.5 gap-3 min-h-[48px] w-full", // Touch-first for gym floor staff
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
