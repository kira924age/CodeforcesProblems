import { makeAchievementData } from "./userUtils";
import { makeSolvedHistory } from "./makeSolvedHistory";
import { firstAcceptedSubmissions } from "./firstAcceptedSubmissions";

const localDate = (year: number, month: number, day: number, hour = 12) =>
  new Date(year, month - 1, day, hour);
const ac = (id: number, date: Date, verdict = "OK", index = "A") => ({
  creationTimeSeconds: date.getTime() / 1000,
  verdict,
  problem: { contestId: id, index, rating: 1200 },
});

test.each([
  [2026, 1, 2025, 12],
  [2026, 2, 2026, 1],
  [2026, 11, 2026, 10],
])(
  "counts the previous calendar month in %i-%i",
  (year, month, previousYear, previousMonth) => {
    const start = localDate(year, month, 1, 0);
    const previousStart = localDate(previousYear, previousMonth, 1, 0);
    const submissions = [
      ac(1, previousStart),
      ac(2, new Date(start.getTime() - 1000)),
      ac(3, start),
      ac(4, new Date(previousStart.getTime() - 1000)),
    ];
    expect(
      makeAchievementData(submissions, localDate(year, month, 8))
        .solvedCountLastMonth
    ).toBe(2);
  }
);

test("counts the previous calendar year using exclusive upper bounds", () => {
  const now = localDate(2026, 11, 8);
  const submissions = [
    ac(1, localDate(2025, 1, 1, 0)),
    ac(2, new Date(localDate(2026, 1, 1, 0).getTime() - 1000)),
    ac(3, localDate(2026, 1, 1, 0)),
    ac(4, new Date(localDate(2025, 1, 1, 0).getTime() - 1000)),
  ];
  expect(makeAchievementData(submissions, now).solvedCountLastYear).toBe(2);
});

test("uses first AC for counts, activity days and history regardless of input order", () => {
  const submissions = [
    ac(1, localDate(2026, 10, 20)), // Repeat AC must not move September's solve.
    ac(2, localDate(2026, 10, 12)),
    ac(1, localDate(2026, 9, 10)),
    ac(3, localDate(2026, 9, 1), "WRONG_ANSWER"),
    ac(2, localDate(2026, 10, 11), "WRONG_ANSWER"),
  ];
  const original = [...submissions];
  const now = localDate(2026, 11, 8);
  const result = makeAchievementData(submissions, now);
  expect(result).toMatchObject({
    solvedCountAll: 2,
    solvedCountLastMonth: 1,
    streakSum: 2,
  });
  expect(makeAchievementData([...submissions].reverse(), now)).toEqual({
    ...result,
    submission: [...submissions].reverse(),
  });
  const history = makeSolvedHistory(submissions);
  expect(history.map((x) => [x.dateFormat, x.count])).toEqual([
    ["2026-09-10", 1],
    ["2026-10-12", 2],
  ]);
  expect(makeSolvedHistory([...submissions].reverse())).toEqual(history);
  expect(submissions).toEqual(original);
});

test("distinguishes problem indexes within one contest", () => {
  const now = localDate(2026, 11, 8);
  const submissions = [ac(1, now), ac(1, now, "OK", "B")];
  expect(firstAcceptedSubmissions(submissions)).toHaveLength(2);
  expect(makeSolvedHistory(submissions)).toHaveLength(1);
  expect(makeSolvedHistory(submissions)[0].count).toBe(2);
});

test("counts one activity day for multiple first ACs and a streak ending today", () => {
  const now = localDate(2026, 11, 8);
  const submissions = [
    ac(1, localDate(2026, 11, 6)),
    ac(2, localDate(2026, 11, 7)),
    ac(3, now),
    ac(4, now),
    ac(1, now),
  ];
  expect(makeAchievementData(submissions, now)).toMatchObject({
    solvedCountAll: 4,
    longestStreak: 3,
    currentStreak: 3,
    streakSum: 3,
  });
});

test("today's repeat AC does not extend a streak and gaps break streaks", () => {
  const submissions = [
    ac(1, localDate(2026, 11, 4)),
    ac(2, localDate(2026, 11, 5)),
    ac(3, localDate(2026, 11, 7)),
    ac(1, localDate(2026, 11, 8)),
  ];
  expect(
    makeAchievementData(submissions, localDate(2026, 11, 8))
  ).toMatchObject({
    longestStreak: 2,
    currentStreak: 0,
    streakSum: 3,
  });
});

test.each([
  [3, 7],
  [10, 31],
])("uses calendar days across DST transitions starting %i/%i", (month, day) => {
  const dates = [0, 1, 2].map(
    (offset) => new Date(2026, month - 1, day + offset, 12)
  );
  expect(
    makeAchievementData(
      dates.map((date, i) => ac(i, date)),
      dates[2]
    )
  ).toMatchObject({
    longestStreak: 3,
    currentStreak: 3,
    streakSum: 3,
  });
});

test("handles empty data and unsuccessful submissions", () => {
  for (const submissions of [
    [],
    [ac(1, localDate(2026, 11, 8), "WRONG_ANSWER")],
  ]) {
    expect(makeAchievementData(submissions)).toMatchObject({
      solvedCountAll: 0,
      solvedCountLastYear: 0,
      solvedCountLastMonth: 0,
      longestStreak: 0,
      currentStreak: 0,
      streakSum: 0,
    });
    expect(makeSolvedHistory(submissions)).toEqual([]);
  }
});
