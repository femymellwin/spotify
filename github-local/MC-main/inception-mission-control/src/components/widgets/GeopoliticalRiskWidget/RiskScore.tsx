"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { RiskAssessment } from "@/types/geopolitical";

interface RiskScoreProps {
  risk: RiskAssessment;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "JUST NOW";
  if (mins < 60) return `${mins}M AGO`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}H AGO`;
}

const LEVEL_BG: Record<string, string> = {
  LOW:      "rgba(0, 208, 132, 0.08)",
  ELEVATED: "rgba(255, 215, 0, 0.08)",
  HIGH:     "rgba(255, 102, 0, 0.10)",
  CRITICAL: "rgba(255, 51, 51, 0.12)",
};

const LEVEL_BORDER: Record<string, string> = {
  LOW:      "#00d084",
  ELEVATED: "#ffd700",
  HIGH:     "#ff6600",
  CRITICAL: "#ff3333",
};

// Split rationale at the first number + unit (e.g. "2 reports", "3 sources")
// so we can hyperlink just that token.
function splitRationale(rationale: string): {
  before: string;
  countText: string | null;
  after: string;
} {
  const m = /(\d+)\s+(report|source|indicator)/i.exec(rationale);
  if (!m) return { before: rationale, countText: null, after: "" };
  return {
    before: rationale.slice(0, m.index),
    countText: m[0],
    after: rationale.slice(m.index + m[0].length),
  };
}

export function RiskScore({ risk }: RiskScoreProps) {
  const [expanded, setExpanded] = useState(false);
  const borderColor = LEVEL_BORDER[risk.level] ?? "#555";
  const bgColor     = LEVEL_BG[risk.level] ?? "transparent";
  const hasDrivers  = risk.drivingArticles.length > 0;
  const { before, countText, after } = splitRationale(risk.rationale);

  return (
    <div className="flex-shrink-0" style={{ borderBottom: `1px solid ${borderColor}` }}>
      {/* ── Main score bar ── */}
      <div
        className="flex items-center gap-4 px-3 py-2"
        style={{ background: bgColor }}
      >
        {/* Score dial */}
        <div className="flex flex-col items-center flex-shrink-0">
          <span
            className="text-3xl font-black tabular-nums leading-none"
            style={{ color: risk.color }}
          >
            {risk.score}
          </span>
          <span className="text-2xs text-bloomberg-muted tracking-widest">/10</span>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-bloomberg-border flex-shrink-0" />

        {/* Level + rationale */}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-black tracking-[0.2em]"
              style={{ color: risk.color }}
            >
              {risk.level}
            </span>
            <span className="text-2xs text-bloomberg-muted">THREAT LEVEL</span>
          </div>
          <p className="text-2xs text-bloomberg-text leading-snug">
            {before}
            {countText && hasDrivers ? (
              <button
                onClick={() => setExpanded((v) => !v)}
                className={cn(
                  "underline underline-offset-2 font-bold cursor-pointer transition-colors",
                  expanded
                    ? "text-bloomberg-accent"
                    : "text-bloomberg-muted-light hover:text-bloomberg-accent"
                )}
                style={{ background: "none", border: "none", padding: 0, font: "inherit" }}
              >
                {countText}
              </button>
            ) : (
              countText
            )}
            {after}
          </p>
        </div>

        {/* Timestamp + driver toggle */}
        <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
          <span className="text-2xs text-bloomberg-muted tracking-widest">ASSESSED</span>
          <span className="text-2xs" style={{ color: risk.color }}>
            {timeAgo(risk.assessedAt)}
          </span>
          {hasDrivers && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-2xs tracking-widest cursor-pointer transition-colors"
              style={{
                color: expanded ? risk.color : "#555",
                background: "none",
                border: "none",
                padding: 0,
                font: "inherit",
              }}
            >
              {expanded
                ? "▲ HIDE"
                : `▼ ${risk.drivingArticles.length} DRIVER${risk.drivingArticles.length !== 1 ? "S" : ""}`}
            </button>
          )}
        </div>
      </div>

      {/* ── Expandable driving articles ── */}
      {expanded && hasDrivers && (
        <div className="border-t" style={{ borderColor, background: bgColor }}>
          <div className="px-3 py-1">
            <span
              className="text-2xs font-bold tracking-widest"
              style={{ color: risk.color }}
            >
              SCORE DRIVERS — {risk.drivingArticles.length} REPORT{risk.drivingArticles.length !== 1 ? "S" : ""}
            </span>
          </div>
          <div
            className="divide-y"
            style={{ borderColor: "var(--color-border)" }}
          >
            {risk.drivingArticles.map((article) => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 px-3 py-1.5 hover:bg-bloomberg-bg group"
              >
                <span
                  className="text-2xs font-bold tracking-wide flex-shrink-0 w-20 truncate"
                  style={{ color: risk.color }}
                >
                  {article.source.toUpperCase()}
                </span>
                <p className="text-2xs text-bloomberg-text leading-snug group-hover:text-bloomberg-accent transition-colors line-clamp-2 flex-1">
                  {article.title}
                </p>
                <span className="text-2xs text-bloomberg-muted flex-shrink-0">↗</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
