export type RiskLevel = "LOW" | "ELEVATED" | "HIGH" | "CRITICAL";

export interface RiskAssessment {
  score: number;       // 1–10
  level: RiskLevel;
  color: string;       // hex color for UI
  rationale: string;   // brief explanation of what drove the score
  assessedAt: string;  // ISO timestamp
  drivingArticles: GeopoliticalArticle[]; // articles that contributed most to the score
}

export interface GeopoliticalArticle {
  id: string;
  title: string;
  description: string | null;
  url: string;
  source: string;
  publishedAt: string;
  isOfficialStatement: boolean;  // true = WAM / UAE MFA / government source
  isAbuDhabiSpecific: boolean;
}

export interface GeopoliticalRiskResponse {
  risk: RiskAssessment;
  officialStatements: GeopoliticalArticle[];
  conflictNews: GeopoliticalArticle[];
  abuDhabiNews: GeopoliticalArticle[];
  fetchedAt: string;
}
