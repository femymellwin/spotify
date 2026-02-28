"use client";

import { useEffect, useState } from "react";

interface DubaiTime {
  time: string;   // HH:MM:SS
  date: string;   // FRIDAY, 28 FEB 2026
  iso: string;
}

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dubai",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dubai",
  weekday: "long",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function getDubaiTime(): DubaiTime {
  const now = new Date();
  const time = timeFormatter.format(now);
  const date = dateFormatter.format(now).toUpperCase();
  return { time, date, iso: now.toISOString() };
}

// Return null until after mount so server and client render the same HTML
export function useDubaiTime(): DubaiTime | null {
  const [dubaiTime, setDubaiTime] = useState<DubaiTime | null>(null);

  useEffect(() => {
    // Set immediately on mount, then tick every second
    setDubaiTime(getDubaiTime());
    const id = setInterval(() => {
      setDubaiTime(getDubaiTime());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return dubaiTime;
}
