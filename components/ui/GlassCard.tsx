"use client";

import { cn } from "@/lib/utils";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  level?: 1 | 2;
}

export function GlassCard({ className, level = 1, ...props }: Props) {
  return (
    <div
      className={cn(
        "rounded-2xl",
        level === 1 ? "glass" : "glass-2",
        className
      )}
      {...props}
    />
  );
}
