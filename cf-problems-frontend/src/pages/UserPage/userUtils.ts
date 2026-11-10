import { firstAcceptedSubmissions } from "./firstAcceptedSubmissions";

// UTC is used only to number local calendar dates, avoiding 23/25-hour DST days.
const localDayNumber = (date: Date): number =>
  Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000;

export const makeAchievementData = (submission: any[], now = new Date()) => {
  const firstAccepted = firstAcceptedSubmissions(submission);
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthStart = new Date(year, month, 1).getTime();
  const previousMonthStart = new Date(year, month - 1, 1).getTime();
  const yearStart = new Date(year, 0, 1).getTime();
  const previousYearStart = new Date(year - 1, 0, 1).getTime();
  let solvedCountLastMonth = 0;
  let solvedCountLastYear = 0;
  const solvedDays = new Set<number>();

  for (const accepted of firstAccepted) {
    const timestamp = accepted.creationTimeSeconds * 1000;
    if (timestamp >= previousMonthStart && timestamp < monthStart)
      solvedCountLastMonth++;
    if (timestamp >= previousYearStart && timestamp < yearStart)
      solvedCountLastYear++;
    solvedDays.add(localDayNumber(new Date(timestamp)));
  }

  const days = [...solvedDays].sort((a, b) => a - b);
  let longestStreak = 0;
  let streak = 0;
  days.forEach((day, index) => {
    streak = index > 0 && day === days[index - 1] + 1 ? streak + 1 : 1;
    longestStreak = Math.max(longestStreak, streak);
  });
  let currentStreak = 0;
  let day = localDayNumber(now);
  while (solvedDays.has(day)) {
    currentStreak++;
    day--;
  }

  return {
    submission,
    solvedCountAll: firstAccepted.length,
    solvedCountLastYear,
    solvedCountLastMonth,
    longestStreak,
    currentStreak,
    streakSum: solvedDays.size,
  };
};
