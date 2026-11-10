import React from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Filler,
  Tooltip,
} from "chart.js";
import { CustomTooltip } from "./CustomTooltip";
import {
  climbingChartConfig,
  pointTotal,
  type SolvedHistoryPoint,
  type TooltipPosition,
} from "./climbingChartConfig";
import "./Climbing.css";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Filler,
  Tooltip
);

type Props = { solvedHistory: SolvedHistoryPoint[] };
type Selection = TooltipPosition & { history: SolvedHistoryPoint[] };

const Climbing = ({ solvedHistory }: Props) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const chartRef = React.useRef<Chart<"line"> | null>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const selectedIndex = React.useRef<number | null>(null);
  const [selection, setSelection] = React.useState<Selection | null>(null);
  const active = selection?.history === solvedHistory ? selection : null;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    selectedIndex.current = null;
    const chart = new Chart(
      canvas,
      climbingChartConfig(
        solvedHistory,
        (position) => {
          selectedIndex.current = position?.index ?? null;
          setSelection(
            position ? { ...position, history: solvedHistory } : null
          );
        },
        getComputedStyle(canvas).fontFamily
      )
    );
    chartRef.current = chart;
    return () => {
      chartRef.current = null;
      chart.destroy();
    };
  }, [solvedHistory]);

  React.useLayoutEffect(() => {
    const tooltip = tooltipRef.current;
    const parent = tooltip?.parentElement;
    if (!tooltip || !parent || !active) return;
    tooltip.style.left = `${Math.max(0, Math.min(active.x + 10, parent.clientWidth - tooltip.offsetWidth))}px`;
    tooltip.style.top = `${Math.max(0, Math.min(active.y, parent.clientHeight - tooltip.offsetHeight))}px`;
  }, [active]);

  const select = (index: number | null) => {
    const chart = chartRef.current;
    if (!chart) return;
    const point = index === null ? undefined : solvedHistory[index];
    const elements = point
      ? chart.data.datasets.map((_, datasetIndex) => ({
          datasetIndex,
          index: index!,
        }))
      : [];
    const position = point
      ? {
          x: chart.scales.x.getPixelForValue(point.dateSecond),
          y: chart.scales.y.getPixelForValue(pointTotal(point)),
        }
      : { x: 0, y: 0 };
    chart.setActiveElements(elements);
    chart.tooltip?.setActiveElements(elements, position);
    chart.update("none");
    if (!point) {
      selectedIndex.current = null;
      setSelection(null);
    }
  };

  return (
    <>
      <h3 className="user-chart-heading">Climbing</h3>
      <hr />
      <div className="climbing-chart">
        <canvas
          ref={canvasRef}
          role="application"
          aria-label="Climbing: cumulative solved problems. Use left and right arrow keys to explore."
          tabIndex={0}
          onFocus={() => {
            if (selectedIndex.current === null && solvedHistory.length)
              select(0);
          }}
          onBlur={() => select(null)}
          onKeyDown={(event) => {
            if (
              !["ArrowLeft", "ArrowRight", "Home", "End", "Escape"].includes(
                event.key
              )
            )
              return;
            event.preventDefault();
            if (event.key === "Escape") {
              select(null);
              return;
            }
            if (!solvedHistory.length) return;
            const index = selectedIndex.current ?? 0;
            select(
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? solvedHistory.length - 1
                  : Math.max(
                      0,
                      Math.min(
                        solvedHistory.length - 1,
                        index + (event.key === "ArrowLeft" ? -1 : 1)
                      )
                    )
            );
          }}
        />
        {active && solvedHistory[active.index] && (
          <div
            ref={tooltipRef}
            className="climbing-tooltip-position"
            role="status"
            aria-live="polite"
          >
            <CustomTooltip point={solvedHistory[active.index]} />
          </div>
        )}
      </div>
    </>
  );
};
export default Climbing;
