export type NarrativeStance =
  | "PRO_IRAN"
  | "PRO_US"
  | "PRO_UAE"
  | "NEUTRAL"
  | "ANTI_ESCALATION"
  | "ALARMIST"
  | "DISINFORMATION";

export type EntityType = "MILITARY" | "GOVERNMENT" | "PERSON" | "LOCATION" | "ORGANIZATION";
export type Sentiment = "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "MIXED";
export type InfoOpType =
  | "COORDINATED_AMPLIFICATION"
  | "RECYCLED_CONTENT"
  | "NARRATIVE_INJECTION"
  | "ASTROTURFING"
  | "FRAMING_SHIFT";

export interface NarrativeThread {
  id: string;
  title: string;          // e.g. "Iran Frames Gulf Escalation as US Provocation"
  summary: string;        // 1–2 sentence description
  stance: NarrativeStance;
  sources: string[];      // outlets pushing this narrative
  evidenceQuotes: string[]; // representative headlines/quotes
  confidence: number;     // 0–100
  isEmerging: boolean;    // appeared in last 4 hours
  dominanceScore: number; // 0–100, how widespread this narrative is
}

export interface SourceProfile {
  name: string;
  slant: string;          // e.g. "UAE state media", "Iranian state", "Pro-Western"
  primaryNarrative: string;
  credibilityScore: number; // 0–100
  recentHeadlines: string[];
}

export interface EntityMention {
  name: string;
  type: EntityType;
  framing: string;        // How this entity is being portrayed
  sentiment: Sentiment;
  mentionCount: number;
  sources: string[];
}

export interface InformationOperation {
  type: InfoOpType;
  headline: string;
  description: string;
  suspectedOrigin: string;
  confidence: number;
  affectedSources: string[];
}

export interface NarrativeAnalysis {
  executiveSummary: string;           // 2–3 sentence overview
  dominantNarratives: NarrativeThread[];
  emergingThreads: NarrativeThread[];
  sourceProfiles: SourceProfile[];
  keyEntities: EntityMention[];
  infoOps: InformationOperation[];
  overallSentiment: Sentiment;
  narrativeShift: string;             // Notable shift vs expected baseline
  analysedAt: string;                 // ISO timestamp
  articlesAnalysed: number;
}
