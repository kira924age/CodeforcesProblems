import contests from "./contests.json";

const STATIC_API_BASE_URL = "https://codeforces.com/api";

export const cachedContestArray = () => contests;

type CachedRequest<T> = {
  request: Promise<T>;
  lastSuccess?: Promise<T>;
};

// Share in-flight requests across screens. Only the latest request can update
// the cache, and a failed refresh keeps the last successful response.
function cachedRequest<T>(
  cache: Map<string, CachedRequest<T>>,
  userId: string,
  refresh: boolean,
  load: () => Promise<T>,
  maxEntries = Infinity
) {
  const previous = cache.get(userId);
  if (!refresh && previous) {
    cache.delete(userId);
    cache.set(userId, previous);
    const { request, lastSuccess } = previous;
    return lastSuccess && request !== lastSuccess
      ? request.catch(() => lastSuccess)
      : request;
  }

  const request = load();
  const lastSuccess = previous?.lastSuccess;
  const entry: CachedRequest<T> = { request, lastSuccess };
  cache.delete(userId);
  cache.set(userId, entry);
  if (cache.size > maxEntries) {
    const oldest = cache.keys().next();
    if (!oldest.done) cache.delete(oldest.value);
  }
  void request.then(
    () => {
      if (cache.get(userId) === entry) entry.lastSuccess = request;
    },
    () => {
      if (cache.get(userId) !== entry) return;
      if (lastSuccess) {
        entry.request = lastSuccess;
      } else {
        cache.delete(userId);
      }
    }
  );
  return request;
}

export interface Submission {
  submissionId: number;
  creationTimeSeconds: number;
  problem: { contestId?: number; index: string; name: string; rating?: number };
  verdict?: string;
  programmingLanguage: string;
}

const MAX_CACHED_SUBMISSION_HANDLES = 5;
const submissionCache = new Map<string, CachedRequest<Submission[]>>();
export const cachedSubmissionHistory = (userId: string, refresh = false) =>
  cachedRequest(
    submissionCache,
    userId,
    refresh,
    async () => {
      const response = await fetch(
        STATIC_API_BASE_URL + "/user.status?handle=" + userId,
        { cache: refresh ? "no-store" : "default" }
      );
      const payload = await response.json();
      if (!response.ok || !Array.isArray(payload.result)) {
        throw new Error("Failed to load Codeforces submissions");
      }

      const entries: Array<Omit<Submission, "submissionId"> & { id: number }> =
        payload.result;
      return entries.map((entry) => ({
        creationTimeSeconds: entry.creationTimeSeconds,
        problem: entry.problem,
        verdict: entry.verdict,
        programmingLanguage: entry.programmingLanguage,
        submissionId: entry.id,
      }));
    },
    MAX_CACHED_SUBMISSION_HANDLES
  );

export const cachedUserSubmissions = async (
  userId: string,
  refresh = false
) => {
  const entries = await cachedSubmissionHistory(userId, refresh);
  const submissions = new Map<string, boolean>();
  for (const entry of entries) {
    const key = String(entry.problem.contestId) + entry.problem.index;
    submissions.set(
      key,
      Boolean(submissions.get(key)) || entry.verdict === "OK"
    );
  }
  return submissions;
};

type UserInfo = {
  userRating: number;
};

const userInfoCache = new Map<string, CachedRequest<UserInfo | null>>();
export const cachedUserInfo = (userId: string, refresh = false) =>
  cachedRequest(userInfoCache, userId, refresh, async () => {
    const response = await fetch(
      STATIC_API_BASE_URL + "/user.info?handles=" + userId,
      { cache: refresh ? "no-store" : "default" }
    );
    const payload = await response.json();
    if (
      payload.status === "FAILED" &&
      /not found/i.test(payload.comment ?? "")
    ) {
      return null;
    }
    if (!response.ok || payload.status !== "OK" || !payload.result?.[0]) {
      throw new Error("Failed to load Codeforces user");
    }
    return { userRating: payload.result[0].rating };
  });
