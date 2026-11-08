import React from "react";
import { Select } from "antd";
import { useTheme } from "../../components/ThemeProvider";
import {
  calendarDays,
  colorDomain,
  dayColor,
  heatmapColors,
  type HeatmapDatum,
} from "./heatmapUtils";
import "./Heatmap.css";

interface Props {
  data: HeatmapDatum[];
}
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const HEIGHT = 300;

const Calendar = ({ data, year }: Props & { year: string }) => {
  const theme = useTheme();
  const container = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(850);
  const [selection, setSelection] = React.useState<{
    data: HeatmapDatum[];
    index: number;
  }>();
  const tooltipId = React.useId();
  const instructionsId = React.useId();
  React.useLayoutEffect(() => {
    const element = container.current;
    if (!element) return;
    const update = (value: number) => {
      if (value > 0) setWidth(value);
    };
    update(element.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) =>
      update(entry.contentRect.width)
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const days = React.useMemo(() => calendarDays(year), [year]);
  const values = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const point of data)
      if (!map.has(point.day)) map.set(point.day, point.value);
    return map;
  }, [data]);
  const domain = React.useMemo(() => colorDomain(data), [data]);
  const columns = days[days.length - 1].column + 1;
  const cell = Math.max(1, Math.min((width - 30) / columns, 245 / 7));
  const originX = 25 + Math.max(0, (width - 30 - columns * cell) / 2);
  const originY = 20 + (245 - 7 * cell) / 2;
  const textColor = theme === "dark" ? "#fff" : "#333";
  const borderColor = theme === "dark" ? "#333" : "#fff";
  const selected = selection?.data === data ? days[selection.index] : undefined;
  const select = (index: number) =>
    setSelection((previous) =>
      previous?.data === data && previous.index === index
        ? previous
        : { data, index }
    );
  const lastActive = () =>
    Math.max(
      0,
      days.findLastIndex((day) => values.has(day.day))
    );
  const selectTarget = (event: React.PointerEvent<SVGSVGElement>) => {
    const target = event.target;
    const index =
      target instanceof Element ? target.getAttribute("data-index") : null;
    if (index !== null) select(Number(index));
    else setSelection(undefined);
  };
  const legend =
    domain[0] === domain[1]
      ? [{ color: heatmapColors[3], value: domain[0] }]
      : heatmapColors.map((color, index) => ({
          color,
          value: Math.ceil(domain[0] + (index * (domain[1] - domain[0])) / 4),
        }));

  const cells = React.useMemo(
    () =>
      days.map((day, index) => (
        <rect
          key={day.day}
          data-day={day.day}
          data-index={index}
          data-value={values.get(day.day) ?? 0}
          x={originX + day.column * cell}
          y={originY + day.weekday * cell}
          width={cell}
          height={cell}
          fill={dayColor(values.get(day.day), domain)}
          stroke={borderColor}
          strokeWidth={0.5}
        />
      )),

    [days, values, domain, originX, originY, cell, borderColor]
  );

  return (
    <div className="heatmap-calendar" ref={container}>
      <p className="heatmap-instructions" id={instructionsId}>
        Daily submissions in {year}. Use Up and Down for adjacent days, Left and
        Right for adjacent weeks, Home or End to jump, and Escape to close the
        tooltip.
      </p>
      <svg
        className="heatmap-svg"
        width="100%"
        height={HEIGHT}
        viewBox={`0 0 ${width} ${HEIGHT}`}
        role="img"
        aria-label={`Submission heatmap for ${year}`}
        aria-describedby={`${instructionsId}${selected ? ` ${tooltipId}` : ""}`}
        tabIndex={0}
        onFocus={() => select(lastActive())}
        onBlur={() => setSelection(undefined)}
        onPointerMove={selectTarget}
        onPointerDown={(event) => {
          event.currentTarget.focus();
          selectTarget(event);
        }}
        onPointerLeave={(event) => {
          if (event.pointerType !== "touch") setSelection(undefined);
        }}
        onPointerCancel={() => setSelection(undefined)}
        onKeyDown={(event) => {
          const index = selected && selection ? selection.index : lastActive();
          const next = {
            ArrowUp: index - 1,
            ArrowDown: index + 1,
            ArrowLeft: index - 7,
            ArrowRight: index + 7,
            Home: 0,
            End: days.length - 1,
          }[event.key];
          if (next !== undefined) {
            event.preventDefault();
            select(Math.max(0, Math.min(days.length - 1, next)));
          } else if (event.key === "Escape") setSelection(undefined);
        }}
      >
        <title>Daily submission counts in {year}</title>
        {cells}
        <g
          className="heatmap-labels"
          fill={textColor}
          pointerEvents="none"
          aria-hidden="true"
        >
          {MONTHS.map((month, index) => {
            const monthDays = days.filter((day) => day.month === index);
            const middle =
              (monthDays[0].column +
                monthDays[monthDays.length - 1].column +
                1) /
              2;
            return (
              <text
                key={month}
                x={originX + middle * cell}
                y={originY - 10}
                textAnchor="middle"
              >
                {month}
              </text>
            );
          })}
          <text
            transform={`translate(${originX - 10},${originY + cell * 3.5}) rotate(-90)`}
            textAnchor="middle"
          >
            {year}
          </text>
        </g>
        <g
          className="heatmap-legend"
          fill={textColor}
          role="list"
          aria-label="Submission count colors"
        >
          {legend.map((entry, index) => (
            <g
              key={index}
              role="listitem"
              aria-label={`At least ${entry.value} submissions`}
              transform={`translate(${width - legend.length * 56 - 5 + index * 56},${HEIGHT - 25})`}
            >
              <rect width={12} height={12} fill={entry.color} />
              <text x={16} y={10}>
                ≥{entry.value}
              </text>
            </g>
          ))}
        </g>
        {selected && (
          <rect
            className="heatmap-selected"
            x={originX + selected.column * cell}
            y={originY + selected.weekday * cell}
            width={cell}
            height={cell}
          />
        )}
      </svg>
      {selected && (
        <div
          id={tooltipId}
          className="heatmap-tooltip"
          role="tooltip"
          style={{
            left: Math.max(
              4,
              Math.min(originX + (selected.column + 1) * cell, width - 150)
            ),
            top: Math.max(4, originY + selected.weekday * cell - 60),
          }}
        >
          <div>{selected.day}</div>
          <div>{values.get(selected.day) ?? 0} submissions</div>
        </div>
      )}
    </div>
  );
};

const Heatmap: React.FunctionComponent<Props> = ({ data }) => {
  const years = [...new Set(data.map((point) => point.day.slice(0, 4)))]
    .sort()
    .reverse();
  const [selectedYear, setSelectYear] = React.useState<string>();
  const year =
    selectedYear && years.includes(selectedYear) ? selectedYear : years[0];
  return (
    <>
      <h3>Heatmap</h3>
      <hr />
      {year ? (
        <div className="heatmap">
          <div className="heatmap-controls">
            <Select
              aria-label="Heatmap year"
              value={year}
              style={{ width: 150, textAlign: "left" }}
              options={years.map((value) => ({ value, label: value }))}
              onChange={setSelectYear}
            />
          </div>
          <Calendar key={year} data={data} year={year} />
        </div>
      ) : (
        <p>No submissions yet.</p>
      )}
    </>
  );
};
export default Heatmap;
