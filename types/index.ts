export type TimerColor = "green" | "yellow" | "red";
export type TimerStatus = "idle" | "running" | "paused" | "overtime";

export interface ServiceSection {
  id: string;
  name: string;
  duration: number; // seconds
  speaker?: string; // only for Predigt
  color?: string;
  notes?: string;
}

export interface BibleVerse {
  reference: string;
  text: string;
  translation: string;
  verseId?: string;  // api.bible verse ID  e.g. "JHN.3.16"
  bibleId?: string;  // api.bible Bible ID used to fetch this verse
}

export interface ServiceState {
  sections: ServiceSection[];
  currentIndex: number;
  timerStatus: TimerStatus;
  remaining: number; // seconds
  endTime: number | null; // Date.now() + remaining*1000 when running
  currentVerse: BibleVerse | null;
  presenterMessage: string;
}

export interface BroadcastPayload {
  type: "STATE_UPDATE";
  state: {
    sectionName: string;
    remaining: number;
    status: TimerStatus;
    verse: BibleVerse | null;
    totalDuration: number;
  };
}
