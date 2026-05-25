"use client";

import { cn } from "@/lib/utils";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, id, ...props }: Props) {
  const inputEl = (
    <input
      id={id}
      className={cn(
        "w-full h-9 px-3 rounded-xl text-sm",
        "bg-white/[0.05] border border-white/[0.09] text-[#EEEEFF] placeholder-[#3E4560]",
        "focus:outline-none focus:border-[#3D72F6]/60 focus:bg-white/[0.07] transition-all",
        className
      )}
      {...props}
    />
  );

  if (!label) return inputEl;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-xs font-medium text-[#7580A0] uppercase tracking-widest"
      >
        {label}
      </label>
      {inputEl}
    </div>
  );
}
