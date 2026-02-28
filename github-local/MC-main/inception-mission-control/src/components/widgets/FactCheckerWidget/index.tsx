"use client";

import { useState, useRef } from "react";
import { WidgetShell } from "@/components/widgets/WidgetShell";
import { cn } from "@/lib/utils/cn";
import type { WidgetProps } from "@/types/widget";
import type {
  CombinedFactCheckResult,
  FactCheckVerdict,
  TimelinesVerdict,
} from "@/types/fact-check";

// ── Styling maps ───────────────────────────────────────────────────────────────

const VERDICT_STYLES: Record<
  FactCheckVerdict,
  { label: string; color: string; bg: string; hex: string }
> = {
  VERIFIED:       { label: "VERIFIED",         color: "text-bloomberg-positive", bg: "bg-bloomberg-positive", hex: "#00d084" },
  UNVERIFIED:     { label: "UNVERIFIED",        color: "text-bloomberg-warning",  bg: "bg-bloomberg-warning",  hex: "#ffd700" },
  MISLEADING:     { label: "MISLEADING",        color: "text-bloomberg-accent",   bg: "bg-bloomberg-accent",   hex: "#ff6600" },
  FALSE:          { label: "FALSE",             color: "text-bloomberg-negative", bg: "bg-bloomberg-negative", hex: "#ff3333" },
  RECYCLED:       { label: "RECYCLED CONTENT",  color: "text-bloomberg-negative", bg: "bg-bloomberg-negative", hex: "#ff3333" },
  OUT_OF_CONTEXT: { label: "OUT OF CONTEXT",    color: "text-bloomberg-accent",   bg: "bg-bloomberg-accent",   hex: "#ff6600" },
};

const TIMELINESS_STYLES: Record<TimelinesVerdict, { label: string; color: string }> = {
  TODAY:   { label: "TODAY",         color: "text-bloomberg-positive" },
  RECENT:  { label: "RECENT (1–7d)", color: "text-bloomberg-warning" },
  OLD:     { label: "OLD CONTENT",   color: "text-bloomberg-negative" },
  UNKNOWN: { label: "DATE UNKNOWN",  color: "text-bloomberg-muted" },
};

// ── Confidence bar ─────────────────────────────────────────────────────────────

function ConfidenceBar({ value, label = "CONFIDENCE" }: { value: number; label?: string }) {
  const color =
    value >= 75 ? "bg-bloomberg-positive" : value >= 50 ? "bg-bloomberg-warning" : "bg-bloomberg-negative";
  return (
    <div className="flex items-center gap-2">
      <span className="text-2xs text-bloomberg-muted w-20 flex-shrink-0 tracking-widest">{label}</span>
      <div className="flex-1 h-1.5 bg-bloomberg-border">
        <div className={cn("h-full transition-all duration-500", color)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-2xs text-bloomberg-muted w-8 text-right tabular-nums">{value}%</span>
    </div>
  );
}

// ── Consensus banner ───────────────────────────────────────────────────────────

function ConsensusBanner({ result }: { result: CombinedFactCheckResult }) {
  const style = VERDICT_STYLES[result.consensusVerdict];

  return (
    <div
      className="px-3 py-2 border-b border-bloomberg-border flex-shrink-0"
      style={{ background: `${style.hex}14`, borderLeft: `3px solid ${style.hex}` }}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-black tracking-widest px-2 py-0.5 text-bloomberg-bg", style.bg)}>
            {style.label}
          </span>
          {result.inception && (
            <span className={cn(
              "text-2xs font-bold tracking-widest px-1.5 py-px border",
              result.agreedOn
                ? "text-bloomberg-positive border-bloomberg-positive"
                : "text-bloomberg-warning border-bloomberg-warning"
            )}>
              {result.agreedOn ? "✓ BOTH AGREE" : "⚡ CONFLICTING"}
            </span>
          )}
          {!result.inception && (
            <span className="text-2xs text-bloomberg-muted tracking-widest border border-bloomberg-border px-1.5 py-px">
              CLAUDE ONLY
            </span>
          )}
        </div>
        <span className="text-2xs text-bloomberg-muted">{result.consensusConfidence}% conf.</span>
      </div>

      {/* Post text */}
      <p className="text-2xs text-bloomberg-text leading-snug line-clamp-2 italic">
        &ldquo;{result.postText.slice(0, 160)}{result.postText.length > 160 ? "…" : ""}&rdquo;
      </p>
      {(result.authorUsername ?? result.authorName) && (
        <p className="text-2xs text-bloomberg-muted mt-0.5">
          — {result.authorUsername ? `@${result.authorUsername}` : result.authorName}
        </p>
      )}
    </div>
  );
}

// ── Claude panel ───────────────────────────────────────────────────────────────

function ClaudePanel({ result }: { result: CombinedFactCheckResult }) {
  const { claude } = result;
  const vs = VERDICT_STYLES[claude.verdict];
  const ts = TIMELINESS_STYLES[claude.timeliness];

  return (
    <div className="border-b border-bloomberg-border">
      {/* Engine header */}
      <div className="px-2 py-1 bg-bloomberg-header border-b border-bloomberg-border flex items-center gap-2">
        <span className="text-2xs font-black tracking-widest text-bloomberg-cyan">◆ CLAUDE AI</span>
        <span className={cn("text-2xs font-black tracking-widest px-1.5 py-px text-bloomberg-bg", vs.bg)}>
          {vs.label}
        </span>
        <span className={cn("text-2xs font-bold tracking-widest", ts.color)}>
          {ts.label}
        </span>
        {claude.isConflictRelevant && (
          <span className="text-2xs font-bold text-bloomberg-cyan tracking-widest ml-auto">CONFLICT ✓</span>
        )}
      </div>

      <div className="px-3 py-2 space-y-2">
        <p className="text-2xs text-bloomberg-text leading-relaxed">{claude.reasoning}</p>
        <ConfidenceBar value={claude.confidence} />
        {claude.flags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {claude.flags.map((flag) => (
              <span
                key={flag}
                className="text-2xs px-1.5 py-px bg-bloomberg-header border border-bloomberg-border text-bloomberg-muted tracking-wide"
              >
                {flag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Inception panel ─────────────────────────────────────────────────────────────

function InceptionPanel({ result }: { result: CombinedFactCheckResult }) {
  const { inception, inceptionError } = result;

  if (!inception) {
    return (
      <div className="border-b border-bloomberg-border">
        <div className="px-2 py-1 bg-bloomberg-header border-b border-bloomberg-border">
          <span className="text-2xs font-black tracking-widest text-bloomberg-accent">◆ INCEPTION AI</span>
        </div>
        <div className="px-3 py-2">
          <p className="text-2xs text-bloomberg-negative">{inceptionError ?? "Inception API unavailable"}</p>
        </div>
      </div>
    );
  }

  const vs = VERDICT_STYLES[inception.verdictMapped];
  const webSources = inception.sources.filter((s) => s.type === "web");

  return (
    <div className="border-b border-bloomberg-border">
      {/* Engine header */}
      <div className="px-2 py-1 bg-bloomberg-header border-b border-bloomberg-border flex items-center gap-2">
        <span className="text-2xs font-black tracking-widest text-bloomberg-accent">◆ INCEPTION AI</span>
        <span className={cn("text-2xs font-black tracking-widest px-1.5 py-px text-bloomberg-bg", vs.bg)}>
          {vs.label}
        </span>
        <span className="text-2xs text-bloomberg-muted ml-1">
          ({inception.verdictRaw.toUpperCase()})
        </span>
      </div>

      <div className="px-3 py-2 space-y-2">
        <p className="text-2xs text-bloomberg-text leading-relaxed">{inception.explanation}</p>

        {/* Web sources */}
        {webSources.length > 0 && (
          <div className="space-y-1">
            <span className="text-2xs text-bloomberg-muted tracking-widest">SOURCES</span>
            {webSources.slice(0, 4).map((src, i) => (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-1.5 group"
              >
                <span className="text-2xs text-bloomberg-accent group-hover:text-bloomberg-text flex-shrink-0">↗</span>
                <span className="text-2xs text-bloomberg-muted group-hover:text-bloomberg-text transition-colors leading-snug line-clamp-1">
                  {src.title}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Widget ─────────────────────────────────────────────────────────────────────

export function FactCheckerWidget({ label }: WidgetProps) {
  const [url, setUrl] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<CombinedFactCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<CombinedFactCheckResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  async function runCheck() {
    const trimmed = url.trim();
    if (!trimmed || isChecking) return;

    setIsChecking(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/fact-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const json = await res.json();
      if (!json.success || !json.data) throw new Error(json.error ?? "Fact check failed");
      setResult(json.data);
      setHistory((prev) => [json.data, ...prev].slice(0, 5));
      setUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <WidgetShell
      widgetId="fact-checker"
      label={label}
      isLoading={false}
      isError={false}
      lastUpdated={result ? new Date(result.checkedAt) : undefined}
      liveIndicator={false}
      className="h-full"
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Input bar */}
        <div className="px-2 py-2 border-b border-bloomberg-border bg-bloomberg-bg flex items-center gap-2 flex-shrink-0">
          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runCheck()}
            placeholder="Paste X / social / news link..."
            className={cn(
              "flex-1 bg-bloomberg-header border border-bloomberg-border",
              "text-xs text-bloomberg-text placeholder:text-bloomberg-muted",
              "px-2 py-1.5 outline-none font-mono focus:border-bloomberg-accent transition-colors"
            )}
            disabled={isChecking}
          />
          <button
            onClick={runCheck}
            disabled={!url.trim() || isChecking}
            className={cn(
              "px-3 py-1.5 text-2xs font-black tracking-widest transition-colors flex-shrink-0",
              !url.trim() || isChecking
                ? "bg-bloomberg-border text-bloomberg-muted cursor-not-allowed"
                : "bg-bloomberg-accent text-bloomberg-bg hover:bg-bloomberg-accent/80 cursor-pointer"
            )}
          >
            {isChecking ? "CHECKING…" : "CHECK"}
          </button>
        </div>

        {/* Status bar */}
        <div className="px-2 py-1 border-b border-bloomberg-border bg-bloomberg-header flex items-center gap-2 flex-shrink-0">
          <span className="text-2xs text-bloomberg-muted tracking-widest">
            CLAUDE + INCEPTION DUAL-ENGINE
          </span>
          {isChecking && (
            <span className="ml-auto text-2xs text-bloomberg-accent animate-pulse tracking-widest">
              ● RUNNING BOTH ENGINES…
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="px-3 py-3 border-b border-bloomberg-border border-l-2 border-l-bloomberg-negative bg-bloomberg-bg">
              <p className="text-2xs text-bloomberg-negative font-bold tracking-widest mb-1">ERROR</p>
              <p className="text-xs text-bloomberg-text">{error}</p>
            </div>
          )}

          {result && (
            <>
              <ConsensusBanner result={result} />
              <ClaudePanel result={result} />
              <InceptionPanel result={result} />
            </>
          )}

          {!result && !error && !isChecking && history.length === 0 && (
            <div className="px-3 py-4 text-2xs text-bloomberg-muted italic tracking-wide">
              Paste any social media or news link above. Claude AI and Inception AI will
              both analyse it against today&apos;s UAE-Iran-US conflict context.
            </div>
          )}

          {/* History */}
          {history.length > 1 && (
            <>
              <div className="px-2 py-1 border-y border-bloomberg-border bg-bloomberg-header">
                <span className="text-2xs text-bloomberg-muted tracking-widest">RECENT CHECKS</span>
              </div>
              {history.slice(1).map((r, i) => {
                const vs = VERDICT_STYLES[r.consensusVerdict];
                return (
                  <div
                    key={i}
                    className="px-3 py-2 border-b border-bloomberg-border flex items-center gap-2 cursor-pointer hover:bg-bloomberg-bg"
                    onClick={() => setResult(r)}
                  >
                    <span className={cn("text-2xs font-black tracking-widest px-1.5 py-px text-bloomberg-bg", vs.bg)}>
                      {vs.label}
                    </span>
                    {r.agreedOn && (
                      <span className="text-2xs text-bloomberg-positive">✓</span>
                    )}
                    <span className="text-2xs text-bloomberg-muted truncate flex-1">{r.url}</span>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Legend */}
        <div className="px-2 py-1 border-t border-bloomberg-border bg-bloomberg-header flex items-center gap-3 flex-shrink-0 flex-wrap">
          <span className="text-2xs font-bold text-bloomberg-positive">■ VERIFIED</span>
          <span className="text-2xs font-bold text-bloomberg-warning">■ UNVERIFIED</span>
          <span className="text-2xs font-bold text-bloomberg-accent">■ MISLEADING</span>
          <span className="text-2xs font-bold text-bloomberg-negative">■ FALSE</span>
        </div>
      </div>
    </WidgetShell>
  );
}
