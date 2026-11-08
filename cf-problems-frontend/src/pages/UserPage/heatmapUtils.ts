export interface HeatmapDatum {
  day: string;
  value: number;
}
export const heatmapColors = ["#C6E48B", "#7BC96F", "#239A3B", "#196127"];
export const emptyDayColor = "#ebedf0";

// The keys already represent local calendar dates. UTC arithmetic here avoids
// DST changing the number of cells, without reinterpreting submission times.
export const calendarDays = (year: string) => {
  const start = Date.UTC(Number(year), 0, 1);
  const end = Date.UTC(Number(year) + 1, 0, 1);
  const offset = new Date(start).getUTCDay();
  return Array.from({ length: (end - start) / 86400000 }, (_, index) => {
    const date = new Date(start + index * 86400000);
    return {
      day: date.toISOString().slice(0, 10),
      month: date.getUTCMonth(),
      weekday: date.getUTCDay(),
      column: Math.floor((index + offset) / 7),
    };
  });
};

// Fixed levels keep colors comparable across users, years and new submissions.
export const heatmapLevels = [
  { minimum: 0, label: "0", color: emptyDayColor },
  { minimum: 1, label: "1", color: heatmapColors[0] },
  { minimum: 2, label: "2–3", color: heatmapColors[1] },
  { minimum: 4, label: "4–7", color: heatmapColors[2] },
  { minimum: 8, label: "8+", color: heatmapColors[3] },
];
export const dayColor = (value: number | undefined) =>
  heatmapLevels.findLast((level) => (value ?? 0) >= level.minimum)?.color ??
  emptyDayColor;
