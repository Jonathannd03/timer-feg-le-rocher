"use client";

import { useEffect, useRef } from "react";
import { useServiceStore } from "@/store/serviceStore";
import type { BroadcastPayload } from "@/types";

const CHANNEL_NAME = "feg-timer-sync";

/** Operator side: broadcasts state to presenter window */
export function useBroadcastSender() {
  const sections = useServiceStore((s) => s.sections);
  const currentIndex = useServiceStore((s) => s.currentIndex);
  const remaining = useServiceStore((s) => s.remaining);
  const timerStatus = useServiceStore((s) => s.timerStatus);
  const currentVerse = useServiceStore((s) => s.currentVerse);

  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL_NAME);
    return () => channelRef.current?.close();
  }, []);

  useEffect(() => {
    if (!channelRef.current) return;
    const section = sections[currentIndex];
    const payload: BroadcastPayload = {
      type: "STATE_UPDATE",
      state: {
        sectionName: section?.name ?? "",
        remaining,
        status: timerStatus,
        verse: currentVerse,
        totalDuration: section?.duration ?? 1,
      },
    };
    channelRef.current.postMessage(payload);
  }, [remaining, timerStatus, currentIndex, sections, currentVerse]);
}

/** Presenter side: listens for state from operator */
export function useBroadcastReceiver(
  onUpdate: (payload: BroadcastPayload["state"]) => void
) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (e: MessageEvent<BroadcastPayload>) => {
      if (e.data.type === "STATE_UPDATE") {
        onUpdateRef.current(e.data.state);
      }
    };
    return () => channel.close();
  }, []);
}
