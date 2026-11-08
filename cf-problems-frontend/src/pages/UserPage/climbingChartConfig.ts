import type { ChartConfiguration, Plugin } from "chart.js";
import { ratingColors, getRatingColorCode } from "../../utils/colors";
import { formatDate } from "../../utils/formatDate";

export type SeriesName =
  | Exclude<(typeof ratingColors)[number], "Black">
  | "Other";
export type SolvedHistoryPoint = { dateSecond: number } & Partial<
  Record<SeriesName, number>
>;
export const seriesName = (color: (typeof ratingColors)[number]): SeriesName =>
  color === "Black" ? "Other" : color;
export const pointTotal = (point: SolvedHistoryPoint) =>
  ratingColors.reduce(
    (total, color) => total + (point[seriesName(color)] ?? 0),
    0
  );
export type TooltipPosition = { index: number; x: number; y: number };

export const yAxisTicks = (maximum: number) => {
  const target = Math.max(1, maximum / 4);
  const magnitude = 10 ** Math.floor(Math.log10(target));
  const step = Math.max(
    1,
    Math.ceil(
      [1, 2, 2.5, 4, 5, 8, 10].find((n) => n * magnitude >= target)! * magnitude
    )
  );
  return Array.from(
    { length: Math.max(1, Math.ceil(maximum / step)) + 1 },
    (_, i) => i * step
  );
};

const cursor: Plugin<"line"> = {
  id: "climbingCursor",
  afterDatasetsDraw(chart) {
    const active = chart.getActiveElements()[0];
    if (!active) return;
    const x = active.element.x;
    const { ctx, chartArea } = chart;
    ctx.save();
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, chartArea.top);
    ctx.lineTo(x, chartArea.bottom);
    ctx.stroke();
    ctx.restore();
  },
};

export const climbingChartConfig = (
  history: SolvedHistoryPoint[],
  onTooltip: (position: TooltipPosition | null) => void,
  fontFamily: string
): ChartConfiguration<"line"> => {
  const first = history[0]?.dateSecond ?? 0;
  const last = history.at(-1)?.dateSecond ?? first;
  const yTicks = yAxisTicks(
    history.reduce((max, point) => Math.max(max, pointTotal(point)), 0)
  );
  const font = { family: fontFamily, size: 16 };
  return {
    type: "line",
    data: {
      datasets: ratingColors.map((color, i) => ({
        label: seriesName(color),
        data: history.map((point) => ({
          x: point.dateSecond,
          y: point[seriesName(color)] ?? 0,
        })),
        stack: "solved",
        borderColor: getRatingColorCode(color),
        backgroundColor: `${getRatingColorCode(color)}99`,
        borderWidth: 1,
        fill: i === 0 ? "origin" : "-1",
        tension: 0,
        pointRadius: history.length === 1 ? 3 : 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: getRatingColorCode(color),
        pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 2,
      })),
    },
    plugins: [cursor],
    options: {
      responsive: true,
      onResize: (chart) => {
        // The old caret position is invalid after the canvas width changes.
        chart.setActiveElements([]);
        chart.tooltip?.setActiveElements([], { x: 0, y: 0 });
        onTooltip(null);
      },
      maintainAspectRatio: false,
      animation: false,
      interaction: { mode: "index", axis: "x", intersect: false },
      layout: { padding: { top: 5, right: 30, bottom: 5, left: 20 } },
      plugins: {
        tooltip: {
          enabled: false,
          external: ({ tooltip }) => {
            const index = tooltip.dataPoints?.[0]?.dataIndex;
            onTooltip(
              tooltip.opacity && index !== undefined
                ? { index, x: tooltip.caretX, y: tooltip.caretY }
                : null
            );
          },
        },
      },
      scales: {
        x: {
          type: "linear",
          min: first === last ? first - 43200 : first,
          max: first === last ? last + 43200 : last,
          display: history.length > 0,
          afterBuildTicks: (axis) => {
            axis.ticks = (
              first === last
                ? [first]
                : Array.from(
                    { length: 5 },
                    (_, i) => first + ((last - first) * i) / 4
                  )
            ).map((value) => ({ value }));
          },
          ticks: {
            color: "#666",
            font,
            maxRotation: 0,
            autoSkip: true,
            callback: (value) => formatDate(Number(value)),
          },
          grid: { color: "#ccc" },
          border: { color: "#666", dash: [3, 3] },
        },
        y: {
          type: "linear",
          stacked: true,
          min: 0,
          max: yTicks.at(-1),
          display: history.length > 0,
          afterBuildTicks: (axis) => {
            axis.ticks = yTicks.map((value) => ({ value }));
          },
          afterFit: (axis) => {
            axis.width = 60;
          },
          ticks: {
            color: "#666",
            font,
            precision: 0,
            callback: (value) => String(value),
          },
          grid: { color: "#ccc" },
          border: { color: "#666", dash: [3, 3] },
        },
      },
    },
  };
};
