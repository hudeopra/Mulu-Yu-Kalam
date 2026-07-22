const STORAGE_KEY = "mulu_appointment_rate_limit";
const MAX_SUBMISSIONS = 3;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export interface RateLimitStatus {
  isAllowed: boolean;
  remaining: number;
  resetTime: number | null;
  formattedResetTime: string | null;
}

/**
 * Clean expired timestamps older than 24 hours and return active timestamps.
 */
function getActiveTimestamps(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const now = Date.now();
    const active = parsed.filter(
      (ts) => typeof ts === "number" && now - ts < WINDOW_MS,
    );

    // If any expired, update storage cleanly
    if (active.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(active));
    }

    return active;
  } catch (err) {
    console.warn("Unable to read rate limit storage:", err);
    return [];
  }
}

/**
 * Format remaining milliseconds into human-readable duration (e.g. "14h 22m").
 */
export function formatRemainingTime(resetTimeMs: number): string {
  const diff = Math.max(0, resetTimeMs - Date.now());
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.ceil((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Check if the current device/browser is within the rate limit (<= 3 submissions in 24 hours).
 */
export function checkRateLimit(): RateLimitStatus {
  const timestamps = getActiveTimestamps();

  if (timestamps.length >= MAX_SUBMISSIONS) {
    // Oldest active timestamp determines when the next slot frees up
    const oldestTimestamp = Math.min(...timestamps);
    const resetTime = oldestTimestamp + WINDOW_MS;

    return {
      isAllowed: false,
      remaining: 0,
      resetTime,
      formattedResetTime: formatRemainingTime(resetTime),
    };
  }

  return {
    isAllowed: true,
    remaining: MAX_SUBMISSIONS - timestamps.length,
    resetTime: null,
    formattedResetTime: null,
  };
}

/**
 * Record a successful appointment submission timestamp on this device.
 */
export function recordSubmission(): void {
  try {
    const timestamps = getActiveTimestamps();
    timestamps.push(Date.now());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timestamps));
  } catch (err) {
    console.warn(
      "Unable to record submission timestamp in local storage:",
      err,
    );
  }
}
