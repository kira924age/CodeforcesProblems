import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ChartConfiguration } from "chart.js";
import Climbing from "./Climbing";
import { CustomTooltip } from "./CustomTooltip";
import { climbingChartConfig, yAxisTicks } from "./climbingChartConfig";

// jsdom has no canvas renderer. Exercise lifecycle/interactions here and verify
// the real Chart.js renderer in the browser against the production build.
const mocks = vi.hoisted(() => ({
  instances: [] as Array<{
    config: ChartConfiguration<"line">;
    destroy: ReturnType<typeof vi.fn>;
    setActiveElements: ReturnType<typeof vi.fn>;
  }>,
}));
vi.mock("chart.js", async () => {
  const actual = await vi.importActual<typeof import("chart.js")>("chart.js");
  return {
    ...actual,
    Chart: class {
      static register = vi.fn();
      data;
      scales = {
        x: { getPixelForValue: () => 100 },
        y: { getPixelForValue: () => 50 },
      };
      active: Array<{ index: number }> = [];
      destroy = vi.fn();
      setActiveElements = vi.fn();
      tooltip = {
        setActiveElements: (elements: Array<{ index: number }>) => {
          this.active = elements;
        },
      };
      constructor(
        _canvas: HTMLCanvasElement,
        public config: ChartConfiguration<"line">
      ) {
        this.data = config.data;
        mocks.instances.push(this);
      }
      update() {
        const external = this.config.options?.plugins?.tooltip?.external;
        external?.call(
          {} as never,
          {
            tooltip: {
              opacity: this.active.length ? 1 : 0,
              caretX: 100,
              caretY: 50,
              dataPoints: this.active.map((x) => ({ dataIndex: x.index })),
            },
          } as never
        );
      }
    },
  };
});
afterEach(() => {
  cleanup();
  mocks.instances.length = 0;
});
const dateSecond = new Date(2026, 10, 8).getTime() / 1000;
const history = [
  { dateSecond: dateSecond - 86400 * 10, Grey: 1, Green: 0, Other: 0 },
  { dateSecond, Grey: 2, Green: 3, Other: 1 },
];

test("keeps numeric time spacing, stack order, fill colors and non-animated linear areas", () => {
  const config = climbingChartConfig(history, vi.fn(), "sans-serif");
  expect(config.data.datasets.map((x) => x.label)).toEqual([
    "Red",
    "Orange",
    "Violet",
    "Blue",
    "Cyan",
    "Green",
    "Grey",
    "Other",
  ]);
  expect(config.data.datasets[5]).toMatchObject({
    data: [
      { x: history[0].dateSecond, y: 0 },
      { x: dateSecond, y: 3 },
    ],
    fill: "-1",
    borderColor: "#008000",
    backgroundColor: "#00800099",
    tension: 0,
  });
  expect(config.data.datasets[0].fill).toBe("origin");
  expect(config.options?.animation).toBe(false);
  expect(config.options?.scales?.x).toMatchObject({
    type: "linear",
    min: history[0].dateSecond,
    max: dateSecond,
  });
  expect(config.options?.scales?.y).toMatchObject({ stacked: true, min: 0 });
  expect(yAxisTicks(305)).toEqual([0, 80, 160, 240, 320]);
});

test("keyboard selection shows date and totals, stays in bounds, and dismisses on Escape and blur", () => {
  render(<Climbing solvedHistory={history} />);
  const canvas = screen.getByRole("application");
  fireEvent.focus(canvas);
  expect(screen.getByRole("status")).toHaveTextContent("count : 1");
  fireEvent.keyDown(canvas, { key: "ArrowRight" });
  expect(screen.getByRole("status")).toHaveTextContent("2026-11-08");
  expect(screen.getByRole("status")).toHaveTextContent("count : 6");
  fireEvent.keyDown(canvas, { key: "ArrowRight" });
  expect(screen.getByRole("status")).toHaveTextContent("count : 6");
  fireEvent.keyDown(canvas, { key: "Home" });
  expect(screen.getByRole("status")).toHaveTextContent("count : 1");
  fireEvent.keyDown(canvas, { key: "End" });
  expect(screen.getByRole("status")).toHaveTextContent("count : 6");
  fireEvent.keyDown(canvas, { key: "Escape" });
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  fireEvent.focus(canvas);
  fireEvent.blur(canvas);
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});

test("releases chart instances under StrictMode and on data change, clearing stale tooltips", () => {
  const { rerender, unmount } = render(<Climbing solvedHistory={history} />);
  expect(mocks.instances[0].destroy).toHaveBeenCalledOnce();
  fireEvent.focus(screen.getByRole("application"));
  expect(screen.getByRole("status")).toBeInTheDocument();
  const old = mocks.instances.at(-1)!;
  rerender(<Climbing solvedHistory={[]} />);
  expect(old.destroy).toHaveBeenCalledOnce();
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  const current = mocks.instances.at(-1)!;
  unmount();
  expect(current.destroy).toHaveBeenCalledOnce();
});

test("handles empty and single-point histories without invalid axes or selection", () => {
  render(<Climbing solvedHistory={[]} />);
  fireEvent.focus(screen.getByRole("application"));
  fireEvent.keyDown(screen.getByRole("application"), { key: "ArrowRight" });
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  const config = climbingChartConfig([history[1]], vi.fn(), "sans-serif");
  expect(config.options?.scales?.x).toMatchObject({
    min: dateSecond - 43200,
    max: dateSecond + 43200,
  });
  const radius = config.data.datasets[0].pointRadius;
  expect(typeof radius).toBe("function");
  if (typeof radius === "function") {
    expect(radius({ parsed: { y: 0 } } as never, {} as never)).toBe(0);
    expect(radius({ parsed: { y: 1 } } as never, {} as never)).toBe(3);
  }
});

test("shows nonzero counts in reverse stack order including Other", () => {
  const { container } = render(<CustomTooltip point={history[1]} />);
  expect(screen.getByText("2026-11-08")).toBeInTheDocument();
  expect(screen.getByText("count : 6")).toBeInTheDocument();
  expect(screen.getByText("Other : 1")).toHaveStyle({ color: "#000000" });
  expect(container.textContent).toMatch(/Other : 1Grey : 2Green : 3/);
  expect(screen.queryByText("Red : 0")).not.toBeInTheDocument();
});

test("hides zero-count outlines and hover dots while retaining the first positive segment", () => {
  const dataset = climbingChartConfig(history, vi.fn(), "sans-serif").data
    .datasets[0];
  const segment = dataset.segment;
  const border = typeof segment === "object" ? segment.borderColor : undefined;
  expect(typeof border).toBe("function");
  if (typeof border === "function") {
    expect(
      border(
        { p0: { parsed: { y: 0 } }, p1: { parsed: { y: 0 } } } as never,
        {} as never
      )
    ).toBe("transparent");
    expect(
      border(
        { p0: { parsed: { y: 0 } }, p1: { parsed: { y: 1 } } } as never,
        {} as never
      )
    ).toBe("#FF0000");
    expect(
      border(
        { p0: { parsed: { y: 1 } }, p1: { parsed: { y: 2 } } } as never,
        {} as never
      )
    ).toBe("#FF0000");
  }
  const radius = dataset.pointHoverRadius;
  expect(typeof radius).toBe("function");
  if (typeof radius === "function") {
    expect(radius({ parsed: { y: 0 } } as never, {} as never)).toBe(0);
    expect(radius({ parsed: { y: 1 } } as never, {} as never)).toBe(4);
  }
});
