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

// Match Nivo's minValue="auto" and quantize scale across the entire history.
export const colorDomain = (data: HeatmapDatum[]): [number, number] =>
  data.reduce<[number, number]>(
    ([min, max], point) => [
      Math.min(min, point.value),
      Math.max(max, point.value),
    ],
    [Infinity, -Infinity]
  );
export const dayColor = (
  value: number | undefined,
  [min, max]: [number, number]
) => {
  if (value === undefined) return emptyDayColor;
  const index =
    min === max
      ? 3
      : Math.max(0, Math.min(3, Math.floor(((value - min) / (max - min)) * 4)));
  return heatmapColors[index];
};
