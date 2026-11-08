import { ratingColors } from "../../utils/colors";
export const chartSeries = ratingColors.map((color) =>
  color === "Black" ? "Other" : color
);
export type SolvedHistoryPoint = { dateSecond: number } & Partial<
  Record<(typeof chartSeries)[number], number>
>;
export const pointTotal = (point: SolvedHistoryPoint) =>
  chartSeries.reduce((total, key) => total + (point[key] ?? 0), 0);
export const yAxisTicks = (maximum: number) => {
  const target = Math.max(1, maximum / 4);
  const magnitude = 10 ** Math.floor(Math.log10(target));
  const step =
    [1, 2, 2.5, 4, 5, 8, 10].find((n) => n * magnitude >= target)! * magnitude;
  const integerStep = Math.max(1, Math.ceil(step));
  return Array.from(
    { length: Math.max(1, Math.ceil(maximum / integerStep)) + 1 },
    (_, i) => i * integerStep
  );
};
// Histories are sorted by first-AC time. Binary search keeps hover work small.
export const nearestPoint = (history: SolvedHistoryPoint[], time: number) => {
  let low = 0;
  let high = history.length - 1;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (history[mid].dateSecond < time) low = mid + 1;
    else high = mid;
  }
  return low > 0 &&
    time - history[low - 1].dateSecond <= history[low].dateSecond - time
    ? low - 1
    : low;
};
