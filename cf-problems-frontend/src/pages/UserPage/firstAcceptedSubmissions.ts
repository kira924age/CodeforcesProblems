interface Submission {
  verdict?: string;
  creationTimeSeconds: number;
  problem: { contestId?: number; index: string };
}

/** One first AC per problem, in chronological order, without changing the input. */
export function firstAcceptedSubmissions<T extends Submission>(
  submissions: T[]
): T[] {
  const first = new Map<string, T>();
  for (const submission of submissions) {
    if (submission.verdict !== "OK") continue;
    const key = `${submission.problem.contestId}:${submission.problem.index}`;
    const previous = first.get(key);
    if (
      !previous ||
      submission.creationTimeSeconds < previous.creationTimeSeconds
    ) {
      first.set(key, submission);
    }
  }
  return [...first.values()].sort(
    (a, b) => a.creationTimeSeconds - b.creationTimeSeconds
  );
}
