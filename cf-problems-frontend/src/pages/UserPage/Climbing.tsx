import React from "react";
import { getRatingColorCode, ratingColors } from "../../utils/colors";
import { formatDate } from "../../utils/formatDate";
import { CustomTooltip } from "./CustomTooltip";
import {
  chartSeries,
  nearestPoint,
  pointTotal,
  yAxisTicks,
  type SolvedHistoryPoint,
} from "./climbingChartUtils";
import "./Climbing.css";

interface Props {
  solvedHistory: SolvedHistoryPoint[];
}
const HEIGHT = 300;
const LEFT = 80;
const RIGHT = 30;
const TOP = 5;
const BOTTOM = 265;

const Climbing: React.FunctionComponent<Props> = ({ solvedHistory }) => {
  const container = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(800);
  const [selection, setSelection] = React.useState<{
    history: SolvedHistoryPoint[];
    index: number;
  }>();
  const tooltipId = React.useId();
  const instructionsId = React.useId();
  React.useLayoutEffect(() => {
    const element = container.current;
    if (!element) return;
    const updateWidth = (next: number) => {
      if (next > 0) setWidth(next);
    };
    updateWidth(element.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) =>
      updateWidth(entry.contentRect.width)
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const plotWidth = Math.max(1, width - LEFT - RIGHT);
  const firstTime = solvedHistory[0]?.dateSecond ?? 0;
  const lastTime = solvedHistory.at(-1)?.dateSecond ?? firstTime;
  const domainStart = firstTime === lastTime ? firstTime - 43200 : firstTime;
  const domainEnd = firstTime === lastTime ? lastTime + 43200 : lastTime;
  const ticks = React.useMemo(
    () =>
      yAxisTicks(
        solvedHistory.reduce(
          (max, point) => Math.max(max, pointTotal(point)),
          0
        )
      ),
    [solvedHistory]
  );
  const maxY = ticks[ticks.length - 1];
  const x = (time: number) =>
    LEFT + ((time - domainStart) / (domainEnd - domainStart)) * plotWidth;
  const y = (count: number) => BOTTOM - (count / maxY) * (BOTTOM - TOP);
  const areas = React.useMemo(() => {
    const cumulative = solvedHistory.map(() => 0);
    return chartSeries.map((key, seriesIndex) => {
      const lower = cumulative.slice();
      const upper = solvedHistory.map((point, i) => {
        cumulative[i] += point[key] ?? 0;
        return cumulative[i];
      });
      return { key, color: ratingColors[seriesIndex], lower, upper };
    });
  }, [solvedHistory]);

  // A new user's history must never display a tooltip from the previous user.
  const selected =
    selection?.history === solvedHistory
      ? solvedHistory[selection.index]
      : undefined;
  const select = (index: number) =>
    setSelection((previous) =>
      previous?.history === solvedHistory && previous.index === index
        ? previous
        : { history: solvedHistory, index }
    );
  const selectAtPointer = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!solvedHistory.length) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width) return;
    const position = (event.clientX - rect.left) * (width / rect.width);
    const time =
      domainStart + ((position - LEFT) / plotWidth) * (domainEnd - domainStart);
    select(nearestPoint(solvedHistory, time));
  };
  const paths = React.useMemo(() => {
    const px = (time: number) =>
      LEFT + ((time - domainStart) / (domainEnd - domainStart)) * plotWidth;
    const py = (value: number) => BOTTOM - (value / maxY) * (BOTTOM - TOP);
    return areas.map((area) => {
      const points = solvedHistory.map(
        (point, i) => `${px(point.dateSecond)},${py(area.upper[i])}`
      );
      const lower = solvedHistory
        .map((point, i) => `${px(point.dateSecond)},${py(area.lower[i])}`)
        .reverse();
      return {
        key: area.key,
        color: getRatingColorCode(area.color),
        d: `M${points.join("L")}L${lower.join("L")}Z`,
      };
    });
  }, [areas, solvedHistory, domainStart, domainEnd, plotWidth, maxY]);
  const intervals = Math.max(
    1,
    Math.min(
      4,
      Math.floor((lastTime - firstTime) / 86400),
      Math.floor(plotWidth / 130)
    )
  );
  const dateTicks =
    firstTime === lastTime
      ? [firstTime]
      : Array.from(
          { length: intervals + 1 },
          (_, i) => firstTime + ((lastTime - firstTime) * i) / intervals
        );

  return (
    <>
      <h3>Climbing</h3>
      <hr />
      <div className="climbing-chart" ref={container}>
        <p id={instructionsId} className="climbing-instructions">
          Cumulative first solves by difficulty. Use Left and Right arrow keys
          to inspect dates, Home or End to jump, and Escape to close the
          tooltip.
        </p>
        <svg
          className="climbing-svg"
          width="100%"
          height={HEIGHT}
          viewBox={`0 0 ${width} ${HEIGHT}`}
          role="img"
          aria-label="Climbing: cumulative solved problems by difficulty"
          aria-describedby={`${instructionsId}${selected ? ` ${tooltipId}` : ""}`}
          tabIndex={solvedHistory.length ? 0 : undefined}
          onPointerMove={selectAtPointer}
          onPointerDown={(event) => {
            event.currentTarget.focus();
            selectAtPointer(event);
          }}
          onPointerLeave={(event) => {
            if (event.pointerType !== "touch") setSelection(undefined);
          }}
          onPointerCancel={() => setSelection(undefined)}
          onFocus={() => {
            if (solvedHistory.length) select(solvedHistory.length - 1);
          }}
          onBlur={() => setSelection(undefined)}
          onKeyDown={(event) => {
            if (!solvedHistory.length) return;
            const index =
              selected && selection
                ? selection.index
                : solvedHistory.length - 1;
            const next = {
              ArrowLeft: Math.max(0, index - 1),
              ArrowRight: Math.min(solvedHistory.length - 1, index + 1),
              Home: 0,
              End: solvedHistory.length - 1,
            }[event.key];
            if (next !== undefined) {
              event.preventDefault();
              select(next);
            } else if (event.key === "Escape") setSelection(undefined);
          }}
        >
          <title>Cumulative first solves by difficulty</title>
          {ticks.map((value) => (
            <g key={value} className="climbing-axis" aria-hidden="true">
              <line
                x1={LEFT}
                x2={LEFT + plotWidth}
                y1={y(value)}
                y2={y(value)}
                className="climbing-grid"
              />
              <text
                x={LEFT - 8}
                y={y(value)}
                dy={value === maxY ? "0.8em" : "0.35em"}
                textAnchor="end"
              >
                {value}
              </text>
            </g>
          ))}
          {solvedHistory.length > 0 &&
            dateTicks.map((time, i) => (
              <g key={i} className="climbing-axis" aria-hidden="true">
                <line
                  x1={x(time)}
                  x2={x(time)}
                  y1={TOP}
                  y2={BOTTOM}
                  className="climbing-grid"
                />
                <text
                  x={x(time)}
                  y={BOTTOM + 20}
                  textAnchor={
                    dateTicks.length > 1 && i === dateTicks.length - 1
                      ? "end"
                      : "middle"
                  }
                >
                  {formatDate(time)}
                </text>
              </g>
            ))}
          <path
            className="climbing-axis-line"
            d={`M${LEFT},${TOP}V${BOTTOM}H${LEFT + plotWidth}`}
          />
          {solvedHistory.length > 0 &&
            paths.map((path) => (
              <path
                key={path.key}
                data-series={path.key}
                d={path.d}
                fill={path.color}
                fillOpacity={0.6}
                stroke={path.color}
              />
            ))}
          {selected && (
            <line
              className="climbing-cursor"
              x1={x(selected.dateSecond)}
              x2={x(selected.dateSecond)}
              y1={TOP}
              y2={BOTTOM}
            />
          )}
        </svg>
        {!solvedHistory.length && (
          <p className="climbing-empty">No solved problems yet.</p>
        )}
        {selected && (
          <div
            className="climbing-tooltip-position"
            style={{
              left: Math.max(
                8,
                Math.min(x(selected.dateSecond) + 12, width - 220)
              ),
            }}
          >
            <CustomTooltip point={selected} id={tooltipId} />
          </div>
        )}
      </div>
    </>
  );
};
export default Climbing;
