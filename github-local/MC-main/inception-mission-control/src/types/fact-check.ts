export type FactCheckVerdict =
  | "VERIFIED"       // Corroborated by known sources
  | "UNVERIFIED"     // Cannot confirm or deny — insufficient evidence
  | "MISLEADING"     // Contains true elements but is framed deceptively
  | "FALSE"          // Directly contradicted by known facts
  | "RECYCLED"       // Old content being recirculated as new/breaking
  | "OUT_OF_CONTEXT"; // Real content used in wrong context

export type TimelinesVerdict = "TODAY" | "RECENT" | "OLD" | "UNKNOWN";

// ── Claude result ───────────────────────────────────────────────────────────────

export interface ClaudeFactCheckResult {
  verdict: FactCheckVerdict;
  confidence: number;           // 0–100
  timeliness: TimelinesVerdict;
  isConflictRelevant: boolean;
  reasoning: string;
  flags: string[];
}

// ── Inception result ────────────────────────────────────────────────────────────

export interface InceptionSource {
  title: string;
  url: string;
  snippet: string | null;
  type: "database" | "web";
}

export interface InceptionFactCheckResult {
  verdictRaw: string;           // raw from API: "true" | "false" | "unverified" | ...
  verdictMapped: FactCheckVerdict;
  explanation: string;
  action: string;
  sources: InceptionSource[];
}

// ── Combined result ─────────────────────────────────────────────────────────────

export interface CombinedFactCheckResult {
  url: string;
  postText: string;
  authorUsername?: string;
  authorName?: string;
  postDate?: string;
  // Consensus
  consensusVerdict: FactCheckVerdict;
  consensusConfidence: number;
  agreedOn: boolean;             // true when both engines agree
  // Per-engine
  claude: ClaudeFactCheckResult;
  inception: InceptionFactCheckResult | null;
  inceptionError?: string;
  checkedAt: string;
}

export interface FactCheckRequest {
  url: string;
}

export interface FactCheckApiResponse {
  success: boolean;
  data?: CombinedFactCheckResult;
  error?: string;
}
