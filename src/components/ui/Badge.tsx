import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "danger" | "warning" | "neon" | "neutral" | "info";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "neutral",
  size = "md",
  children,
  ...props
}) => {
  const variantStyles = {
    success: "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60",
    danger: "bg-rose-950/80 text-rose-400 border border-rose-800/60",
    warning: "bg-amber-950/80 text-amber-300 border border-amber-800/60",
    neon: "bg-neon/15 text-neon border border-neon/40 font-bold",
    info: "bg-cyan-950/80 text-cyan-300 border border-cyan-800/60",
    neutral: "bg-zinc-800/90 text-zinc-300 border border-zinc-700/60",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 rounded-full font-medium tracking-tight",
    md: "text-xs px-2.5 py-1 rounded-full font-semibold",
  };

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 uppercase select-none", variantStyles[variant], sizeStyles[size], className)}
      {...props}
    >
      {children}
    </span>
  );
};
