"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { ProgramList } from "@/components/program/ProgramList";

export function RightSidebar() {
  return (
    <aside className="w-[320px] flex-shrink-0 h-full py-4 pr-4 pl-2">
      <GlassCard className="h-full overflow-hidden flex flex-col">
        <ProgramList />
      </GlassCard>
    </aside>
  );
}
