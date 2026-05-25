"use client";

import { useState, useEffect } from "react";

export function useWallClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return time.toLocaleTimeString("de-CH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
