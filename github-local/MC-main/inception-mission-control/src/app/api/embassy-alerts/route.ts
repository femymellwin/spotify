// Server-side only.
// Fetches UAE travel advisory level from State Dept + security alerts
// from the US Embassy Abu Dhabi page. No API key required.

import { NextResponse } from "next/server";

export interface EmbassyAlert {
  id: string;
  title: string;
  date: string;
  summary: string;
  alertType: "security" | "health" | "general";
}

export interface EmbassyAlertsData {
  advisoryLevel: number;       // 1–4
  advisoryText: string;        // e.g. "Exercise Increased Caution"
  advisoryUpdated: string;     // date string
  alerts: EmbassyAlert[];
}

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  Accept: "text/html,application/xhtml+xml",
};

// --- Travel Advisory Level ---
async function fetchAdvisoryLevel(): Promise<{
  level: number;
  text: string;
  updated: string;
}> {
  const url =
    "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/united-arab-emirates-travel-advisory.html";

  const res = await fetch(url, {
    headers: HEADERS,
    next: { revalidate: 3600 }, // 1-hour cache
  });

  if (!res.ok) throw new Error(`Advisory page HTTP ${res.status}`);
  const html = await res.text();

  // Extract level from patterns like "Level 2: Exercise Increased Caution"
  const levelMatch =
    /Level\s+([1-4])\s*[:–—]\s*([^<\n]+)/i.exec(html);

  const level = levelMatch ? parseInt(levelMatch[1]) : 2;
  const text = levelMatch
    ? levelMatch[2].replace(/&amp;/g, "&").replace(/<[^>]+>/g, "").trim()
    : "Exercise Increased Caution";

  // Extract last updated date
  const updatedMatch =
    /(?:Last Updated|Updated|Reviewed)[\s:]+([A-Z][a-z]+\s+\d{1,2},\s+\d{4})/i.exec(html);
  const updated = updatedMatch ? updatedMatch[1] : "";

  return { level, text, updated };
}

// --- Security Alerts ---
async function fetchSecurityAlerts(): Promise<EmbassyAlert[]> {
  const url = "https://ae.usembassy.gov/security-alert/";

  const res = await fetch(url, {
    headers: HEADERS,
    next: { revalidate: 1800 }, // 30-min cache
  });

  if (!res.ok) throw new Error(`Embassy alerts HTTP ${res.status}`);
  const html = await res.text();

  // Strip scripts and styles
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#\d+;/g, "")
    .replace(/\s{3,}/g, "\n\n")
    .trim();

  const alerts: EmbassyAlert[] = [];

  // Look for date-titled alert sections
  // Pattern: Title line followed by date and content
  const alertPattern =
    /(Security Alert|Health Alert|Message to U\.S\. Citizens|Alert)[^\n]*\n+([A-Z][a-z]+\s+\d{1,2},\s+\d{4}[^\n]*)\n+([\s\S]{50,400}?)(?=\n{2,}|Security Alert|Health Alert|Message to|$)/gi;

  let match;
  while ((match = alertPattern.exec(stripped)) !== null && alerts.length < 8) {
    const typeStr = match[1].toLowerCase();
    const alertType: EmbassyAlert["alertType"] = typeStr.includes("health")
      ? "health"
      : typeStr.includes("security")
      ? "security"
      : "general";

    alerts.push({
      id: Math.abs(
        match[2]
          .split("")
          .reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0)
      ).toString(36),
      title: match[1].trim(),
      date: match[2].trim(),
      summary: match[3].replace(/\n+/g, " ").trim().slice(0, 250),
      alertType,
    });
  }

  // Fallback: if no structured alerts found, try to extract the latest text
  if (alerts.length === 0) {
    const datePattern = /([A-Z][a-z]+\s+\d{1,2},\s+\d{4})\s*[\n:]\s*([^\n]{30,300})/g;
    while ((match = datePattern.exec(stripped)) !== null && alerts.length < 5) {
      if (stripped.indexOf("Alert") < match.index + 200) {
        alerts.push({
          id: match[1].replace(/\s/g, ""),
          title: "Security Alert",
          date: match[1],
          summary: match[2].trim(),
          alertType: "security",
        });
      }
    }
  }

  return alerts;
}

export async function GET() {
  try {
    const [advisory, alerts] = await Promise.allSettled([
      fetchAdvisoryLevel(),
      fetchSecurityAlerts(),
    ]);

    const advisoryData =
      advisory.status === "fulfilled"
        ? advisory.value
        : { level: 2, text: "Exercise Increased Caution", updated: "" };

    const alertsData =
      alerts.status === "fulfilled" ? alerts.value : [];

    const data: EmbassyAlertsData = {
      advisoryLevel: advisoryData.level,
      advisoryText: advisoryData.text,
      advisoryUpdated: advisoryData.updated,
      alerts: alertsData,
    };

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Embassy data unavailable";
    console.error("[/api/embassy-alerts]", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
