"use client";

import { cn } from "@/lib/utils";

type Color = "blue" | "green" | "yellow" | "red" | "neutral";

const colors: Record<Color, string> = {
  blue: "bg-[#3D72F6]/[0.15] text-[#3D72F6] border-[#3D72F6]/20",
  green: "bg-[#22C55E]/[0.15] text-[#22C55E] border-[#22C55E]/20",
  yellow: "bg-[#E8A83A]/[0.15] text-[#E8A83A] border-[#E8A83A]/20",
  red: "bg-[#F87171]/[0.15] text-[#F87171] border-[#F87171]/20",
  neutral: "bg-white/[0.05] text-[#7580A0] border-white/[0.08]",
};

interface Props {
  color?: Color;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ color = "neutral", children, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
        colors[color],
        className
      )}
    >
      {children}
    </span>
  );
}
