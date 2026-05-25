"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Plus, ExternalLink } from "lucide-react";
import { useServiceStore } from "@/store/serviceStore";
import { formatTime } from "@/lib/utils";
import { SectionCard } from "./SectionCard";
import { AddSectionModal } from "./AddSectionModal";

export function ProgramList() {
  const sections = useServiceStore((s) => s.sections);
  const currentIndex = useServiceStore((s) => s.currentIndex);
  const reorderSections = useServiceStore((s) => s.reorderSections);
  const [addOpen, setAddOpen] = useState(false);

  const total = sections.reduce((a, s) => a + s.duration, 0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = sections.findIndex((s) => s.id === active.id);
    const newIdx = sections.findIndex((s) => s.id === over.id);
    reorderSections(arrayMove(sections, oldIdx, newIdx));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.05]">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#3E4560]">
            Programm
          </p>
          <p className="text-xs text-[#7580A0] mt-0.5">
            {sections.length} Abschnitte · {formatTime(total)}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <a
            href="/presenter"
            target="_blank"
            rel="noopener"
            className="p-1.5 rounded-lg text-[#7580A0] hover:text-[#EEEEFF] hover:bg-white/[0.05] transition-colors"
            title="Presenter öffnen"
          >
            <ExternalLink size={13} />
          </a>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1 h-7 px-2.5 rounded-lg bg-[#3D72F6]/[0.15] border border-[#3D72F6]/20 text-[#3D72F6] text-xs font-medium hover:bg-[#3D72F6]/20 transition-colors"
          >
            <Plus size={12} />
            Hinzufügen
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-10">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <Plus size={16} className="text-[#3E4560]" />
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-[#3E4560]">Kein Programm</p>
              <p className="text-[11px] text-[#2A2F48] mt-0.5">Abschnitte hinzufügen</p>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {sections.map((section, i) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  index={i}
                  isActive={i === currentIndex}
                  isPast={i < currentIndex}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-white/[0.05]">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#3E4560]">Gesamtdauer</span>
          <span className="font-semibold tabular-nums text-[#7580A0]">
            {formatTime(total)}
          </span>
        </div>
      </div>

      <AddSectionModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
