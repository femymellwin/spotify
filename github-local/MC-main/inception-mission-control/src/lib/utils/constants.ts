export const POLLING_INTERVALS = {
  MONDAY_TASKS: 2 * 60 * 1000,    // 2 minutes
  WORLD_NEWS: 15 * 60 * 1000,     // 15 minutes
  UAE_NEWS: 15 * 60 * 1000,       // 15 minutes
  X_TRENDS: 15 * 60 * 1000,       // 15 minutes (X API rate limit)
  X_CONFLICT: 15 * 60 * 1000,     // 15 minutes
  AVIATION: 2 * 60 * 1000,        // 2 minutes (OpenSky live data)
  COMMODITIES: 15 * 60 * 1000,    // 15 minutes
  VERIFIED_NEWS: 15 * 60 * 1000,  // 15 minutes
  UN_FEED: 20 * 60 * 1000,        // 20 minutes
  EMBASSY_ALERTS: 30 * 60 * 1000, // 30 minutes
  NARRATIVE: 20 * 60 * 1000,      // 20 minutes (Claude API)
  DUBAI_CLOCK: 1000,              // 1 second
} as const;

export const NEWS_QUERIES = {
  world: "geopolitics OR \"world leaders\" OR trade war OR diplomacy OR G7 OR BRICS OR NATO OR sanctions OR international relations",
  uae: "UAE OR Dubai OR \"Abu Dhabi\" OR G42 OR ADNOC OR Emirates OR \"Saudi Arabia\" OR MENA OR \"Middle East\"",
} as const;

export const PRIORITY_ORDER: Record<string, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

export const MONDAY_ACTIVE_STATUSES = [
  "Working on it",
  "In progress",
  "Pending",
  "Stuck",
  "Not started",
  "Waiting for review",
  "In Review",
  "On hold",
] as const;

export const MONDAY_DONE_STATUSES = [
  "Done",
  "Completed",
  "Closed",
  "Cancelled",
  "Archived",
] as const;

// Only show boards whose name contains this string (case-insensitive)
export const SLT_BOARD_NAME_FILTER = "";
