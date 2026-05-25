"use client";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "icon";
type Size = "sm" | "md" | "lg";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[#3D72F6] text-white hover:bg-[#4f83ff] active:scale-[0.97]",
  secondary:
    "bg-white/[0.07] border border-white/[0.10] text-[#EEEEFF] hover:bg-white/[0.11] active:scale-[0.97]",
  ghost:
    "text-[#7580A0] hover:text-[#EEEEFF] hover:bg-white/[0.05] active:scale-[0.97]",
  danger:
    "bg-[#F87171]/[0.15] border border-[#F87171]/20 text-[#F87171] hover:bg-[#F87171]/20 active:scale-[0.97]",
  icon:
    "bg-white/[0.05] border border-white/[0.08] text-[#7580A0] hover:text-[#EEEEFF] hover:bg-white/[0.09] active:scale-[0.97]",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-7 px-3 text-xs rounded-lg",
  md: "h-9 px-4 text-sm rounded-xl",
  lg: "h-11 px-6 text-sm font-medium rounded-xl",
};

export function Button({
  variant = "secondary",
  size = "md",
  className,
  ...props
}: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer select-none",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}
