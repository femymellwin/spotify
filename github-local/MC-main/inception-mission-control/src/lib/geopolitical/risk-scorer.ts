import type { GeopoliticalArticle, RiskAssessment, RiskLevel } from "@/types/geopolitical";

// Keywords weighted by severity — each match adds to the raw score
const CRITICAL_KEYWORDS = [
  "missile strike", "military strike", "attack launched", "bombs dropped",
  "war declared", "invasion", "explosion", "casualties", "killed", "airstrike",
  "nuclear", "ballistic missile",
];

const HIGH_KEYWORDS = [
  "attack", "strike", "escalation", "ultimatum", "retaliation", "aggression",
  "hostilities", "combat", "military action", "fired upon", "warships", "drone attack",
  "naval blockade", "strait of hormuz closed",
];

const ELEVATED_KEYWORDS = [
  "threat", "warning", "deployment", "forces mobilized", "sanctions",
  "confrontation", "standoff", "emergency", "alert", "evacuate",
  "tensions rising", "military buildup",
];

const DEESCALATION_KEYWORDS = [
  "ceasefire", "truce", "peace talks", "diplomatic", "negotiation",
  "agreement", "withdraw", "de-escalation", "resolution", "mediation",
];

function scoreText(text: string): number {
  const lower = text.toLowerCase();
  let delta = 0;
  for (const kw of CRITICAL_KEYWORDS)   if (lower.includes(kw)) delta += 3;
  for (const kw of HIGH_KEYWORDS)       if (lower.includes(kw)) delta += 1.5;
  for (const kw of ELEVATED_KEYWORDS)   if (lower.includes(kw)) delta += 0.75;
  for (const kw of DEESCALATION_KEYWORDS) if (lower.includes(kw)) delta -= 1;
  return delta;
}

function levelFromScore(score: number): { level: RiskLevel; color: string } {
  if (score >= 8) return { level: "CRITICAL", color: "#ff3333" };
  if (score >= 6) return { level: "HIGH",     color: "#ff6600" };
  if (score >= 4) return { level: "ELEVATED", color: "#ffd700" };
  return              { level: "LOW",      color: "#00d084" };
}

function buildRationale(articles: GeopoliticalArticle[], score: number): string {
  const critical = articles.filter((a) => {
    const t = `${a.title} ${a.description ?? ""}`.toLowerCase();
    return CRITICAL_KEYWORDS.some((k) => t.includes(k));
  });
  const deescalating = articles.filter((a) => {
    const t = `${a.title} ${a.description ?? ""}`.toLowerCase();
    return DEESCALATION_KEYWORDS.some((k) => t.includes(k));
  });

  if (critical.length > 0) {
    return `Active kinetic indicators detected across ${critical.length} report${critical.length > 1 ? "s" : ""}.`;
  }
  if (deescalating.length > 0 && score < 5) {
    return `Diplomatic signals present. Monitoring for reversal.`;
  }
  if (score >= 6) {
    return `Sustained escalatory language across ${articles.length} sources. No kinetic confirmation.`;
  }
  return `Tension indicators present. Situation fluid — reassess in 2 hours.`;
}

export function computeRiskScore(
  allArticles: GeopoliticalArticle[]
): RiskAssessment {
  // Baseline: situation is already flagged as active by the CEO
  let raw = 4;

  // Track which articles contributed meaningfully (matched critical or high keywords)
  const drivingArticles: GeopoliticalArticle[] = [];

  for (const article of allArticles) {
    const text = `${article.title} ${article.description ?? ""}`;
    const delta = scoreText(text);
    raw += delta;
    // Include article if it matched at least one critical or high keyword
    if (delta >= 1.5) {
      drivingArticles.push(article);
    }
  }

  // Cap between 1 and 10
  const score = Math.max(1, Math.min(10, Math.round(raw)));
  const { level, color } = levelFromScore(score);
  const rationale = buildRationale(allArticles, score);

  // Sort driving articles: highest individual delta first (re-score to sort)
  drivingArticles.sort(
    (a, b) =>
      scoreText(`${b.title} ${b.description ?? ""}`) -
      scoreText(`${a.title} ${a.description ?? ""}`)
  );

  return {
    score,
    level,
    color,
    rationale,
    assessedAt: new Date().toISOString(),
    drivingArticles,
  };
}
