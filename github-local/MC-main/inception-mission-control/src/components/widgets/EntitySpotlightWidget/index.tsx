"use client";

import { useNarrative } from "@/components/providers/NarrativeProvider";
import { WidgetShell } from "@/components/widgets/WidgetShell";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import type { WidgetProps } from "@/types/widget";
import type { EntityMention, EntityType, Sentiment } from "@/types/narrative";

const ENTITY_TYPE_STYLE: Record<EntityType, { color: string; label: string }> = {
  MILITARY:     { color: "#ff3333", label: "MIL" },
  GOVERNMENT:   { color: "#00bfff", label: "GOV" },
  PERSON:       { color: "#ffd700", label: "PER" },
  LOCATION:     { color: "#00d084", label: "LOC" },
  ORGANIZATION: { color: "#ff6600", label: "ORG" },
};

const SENTIMENT_STYLE: Record<Sentiment, { color: string }> = {
  POSITIVE: { color: "#00d084" },
  NEGATIVE: { color: "#ff3333" },
  NEUTRAL:  { color: "#888888" },
  MIXED:    { color: "#ffd700" },
};

function EntityCard({ entity }: { entity: EntityMention }) {
  const typeStyle = ENTITY_TYPE_STYLE[entity.type];
  const sentimentStyle = SENTIMENT_STYLE[entity.sentiment];

  return (
    <div
      className="flex-shrink-0 flex flex-col gap-1.5 px-3 py-2 border-r border-bloomberg-border min-w-[160px] max-w-[200px]"
      style={{ borderLeft: `3px solid ${typeStyle.color}` }}
    >
      {/* Type + name */}
      <div className="flex items-center gap-1.5">
        <span
          className="text-2xs font-black tracking-widest px-1 py-px"
          style={{ color: typeStyle.color, background: `${typeStyle.color}18` }}
        >
          {typeStyle.label}
        </span>
        <span className="text-2xs text-bloomberg-muted">
          {entity.mentionCount}×
        </span>
      </div>
      <span className="text-xs font-black text-bloomberg-text leading-tight">{entity.name}</span>

      {/* Sentiment */}
      <span
        className="text-2xs font-bold tracking-widest"
        style={{ color: sentimentStyle.color }}
      >
        {entity.sentiment}
      </span>

      {/* Framing */}
      <p className="text-2xs text-bloomberg-muted leading-snug line-clamp-3">
        {entity.framing}
      </p>

      {/* Sources */}
      <div className="flex flex-wrap gap-1 mt-auto">
        {entity.sources.slice(0, 3).map((src) => (
          <span
            key={src}
            className="text-2xs text-bloomberg-muted border border-bloomberg-border px-1 leading-tight"
          >
            {src.slice(0, 8)}
          </span>
        ))}
        {entity.sources.length > 3 && (
          <span className="text-2xs text-bloomberg-muted">+{entity.sources.length - 3}</span>
        )}
      </div>
    </div>
  );
}

export function EntitySpotlightWidget({ label }: WidgetProps) {
  const { data, isLoading, isError, error, lastUpdated, refresh } = useNarrative();

  return (
    <WidgetShell
      widgetId="entity-spotlight"
      label={label}
      isLoading={isLoading && !data}
      isError={isError}
      errorMessage={error?.message}
      onRetry={refresh}
      lastUpdated={lastUpdated}
      liveIndicator={true}
      className="h-full"
    >
      {isLoading && !data ? (
        <LoadingSkeleton lines={3} />
      ) : data ? (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Type legend */}
          <div className="px-2 py-1 border-b border-bloomberg-border bg-bloomberg-header flex items-center gap-3 flex-shrink-0 flex-wrap">
            {Object.entries(ENTITY_TYPE_STYLE).map(([type, style]) => (
              <span key={type} className="text-2xs font-bold" style={{ color: style.color }}>
                ■ {style.label} {type}
              </span>
            ))}
          </div>

          {/* Horizontal scroll of entity cards */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden">
            {data.keyEntities.length === 0 ? (
              <div className="px-3 py-4 text-2xs text-bloomberg-muted italic text-center">
                No key entities identified in current articles
              </div>
            ) : (
              <div className="flex h-full">
                {data.keyEntities.map((entity) => (
                  <EntityCard key={entity.name} entity={entity} />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </WidgetShell>
  );
}
