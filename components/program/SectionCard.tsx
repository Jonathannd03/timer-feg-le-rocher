"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Check, X } from "lucide-react";
import { useServiceStore } from "@/store/serviceStore";
import { formatTime } from "@/lib/utils";
import type { ServiceSection } from "@/types";

interface Props {
  section: ServiceSection;
  index: number;
  isActive: boolean;
  isPast: boolean;
}

export function SectionCard({ section, index, isActive, isPast }: Props) {
  const goToSection = useServiceStore((s) => s.goToSection);
  const updateSection = useServiceStore((s) => s.updateSection);
  const removeSection = useServiceStore((s) => s.removeSection);
  const sections = useServiceStore((s) => s.sections);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(section.name);
  const [editMinutes, setEditMinutes] = useState(
    Math.floor(section.duration / 60)
  );
  const [editSeconds, setEditSeconds] = useState(section.duration % 60);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const save = () => {
    const duration = editMinutes * 60 + editSeconds;
    updateSection(section.id, { name: editName, duration });
    setEditing(false);
  };

  const cancel = () => {
    setEditName(section.name);
    setEditMinutes(Math.floor(section.duration / 60));
    setEditSeconds(section.duration % 60);
    setEditing(false);
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={[
          "group relative flex items-center gap-2.5 px-3 py-3 rounded-xl transition-all duration-150 cursor-pointer",
          isActive
            ? "bg-[#3D72F6]/[0.12] border border-[#3D72F6]/20"
            : isPast
            ? "opacity-40 hover:opacity-60"
            : "hover:bg-white/[0.04]",
        ].join(" ")}
        onClick={() => !editing && goToSection(index)}
      >
        {/* Active indicator */}
        {isActive && (
          <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full bg-[#3D72F6]" />
        )}

        {/* Drag handle */}
        <button
          className="flex-shrink-0 p-0.5 text-[#3E4560] hover:text-[#7580A0] cursor-grab active:cursor-grabbing transition-colors"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={13} />
        </button>

        {/* Index dot */}
        <div
          className={[
            "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold",
            isActive
              ? "bg-[#3D72F6] text-white"
              : isPast
              ? "bg-white/[0.08] text-[#3E4560]"
              : "bg-white/[0.05] text-[#7580A0]",
          ].join(" ")}
        >
          {index + 1}
        </div>

        {editing ? (
          /* Inline edit form */
          <div
            className="flex-1 flex flex-col gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full text-xs bg-white/[0.06] border border-white/[0.10] rounded-lg px-2 py-1 text-[#EEEEFF] focus:outline-none focus:border-[#3D72F6]/60"
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") cancel();
              }}
            />
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={editMinutes}
                onChange={(e) => setEditMinutes(Number(e.target.value))}
                min={0}
                className="w-12 text-xs bg-white/[0.06] border border-white/[0.10] rounded-lg px-2 py-1 text-[#EEEEFF] focus:outline-none text-center"
              />
              <span className="text-[#3E4560] text-xs">m</span>
              <input
                type="number"
                value={editSeconds}
                onChange={(e) => setEditSeconds(Number(e.target.value))}
                min={0}
                max={59}
                className="w-12 text-xs bg-white/[0.06] border border-white/[0.10] rounded-lg px-2 py-1 text-[#EEEEFF] focus:outline-none text-center"
              />
              <span className="text-[#3E4560] text-xs">s</span>
              <button onClick={save} className="ml-1 p-1 rounded-lg bg-[#3D72F6]/20 text-[#3D72F6] hover:bg-[#3D72F6]/30">
                <Check size={11} />
              </button>
              <button onClick={cancel} className="p-1 rounded-lg bg-white/[0.05] text-[#7580A0] hover:text-[#EEEEFF]">
                <X size={11} />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Name + speaker + duration */}
            <div className="flex-1 min-w-0">
              <p
                className={[
                  "text-sm font-medium truncate",
                  isActive ? "text-[#EEEEFF]" : "text-[#7580A0]",
                ].join(" ")}
              >
                {section.name}
              </p>
              {section.speaker && (
                <p className="text-xs text-[#3E4560] truncate mt-0.5">
                  {section.speaker}
                </p>
              )}
            </div>
            <span
              className={[
                "flex-shrink-0 text-sm tabular-nums font-medium",
                isActive ? "text-[#3D72F6] font-semibold" : "text-[#3E4560]",
              ].join(" ")}
            >
              {formatTime(section.duration)}
            </span>

            {/* Actions on hover */}
            <div
              className="flex-shrink-0 hidden group-hover:flex items-center gap-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setEditing(true)}
                className="p-1 rounded-md text-[#3E4560] hover:text-[#7580A0] hover:bg-white/[0.05] transition-colors"
                title="Bearbeiten"
              >
                <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Z" />
                </svg>
              </button>
              <button
                onClick={() => {
                  if (sections.length > 1) removeSection(section.id);
                }}
                className="p-1 rounded-md text-[#3E4560] hover:text-[#F87171] hover:bg-[#F87171]/[0.08] transition-colors"
                title="Löschen"
              >
                <Trash2 size={11} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
