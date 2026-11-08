import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import Climbing from "./Climbing";
import { nearestPoint, yAxisTicks } from "./climbingChartUtils";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const dateSecond = new Date(2026, 10, 8).getTime() / 1000;
const history = [
  { dateSecond: dateSecond - 86400, Grey: 1, Green: 0, Other: 0 },
  { dateSecond, Grey: 2, Green: 3, Other: 1 },
];
const chart = () => screen.getByRole("img", { name: /Climbing: cumulative/ });

test("renders linear stacked areas in the existing difficulty order with dates and count axes", () => {
  const { container } = render(<Climbing solvedHistory={history} />);
  expect(screen.getByRole("heading", { name: "Climbing" })).toBeInTheDocument();
  const areas = [...container.querySelectorAll("path[data-series]")];
  expect(areas.map((p) => p.getAttribute("data-series"))).toEqual([
    "Red",
    "Orange",
    "Violet",
    "Blue",
    "Cyan",
    "Green",
    "Grey",
    "Other",
  ]);
  // A maximum of 6 gives ticks 0, 2, 4, 6. Other is the top band (5 -> 6).
  expect(container.querySelector('[data-series="Other"]')).toHaveAttribute(
    "d",
    "M80,221.66666666666669L770,5L770,48.333333333333314L80,221.66666666666669Z"
  );
  expect(container.querySelector('[data-series="Green"]')).toHaveAttribute(
    "fill",
    "#008000"
  );
  expect(screen.getAllByText("2026-11-08").length).toBeGreaterThan(0);
  expect(screen.getByText("6")).toBeInTheDocument();
  expect(chart()).toHaveAttribute("viewBox", "0 0 800 300");
});

test("shows date, total, nonzero difficulty counts and Other in tooltip order using keyboard navigation", () => {
  render(<Climbing solvedHistory={history} />);
  fireEvent.focus(chart());
  const tooltip = screen.getByRole("tooltip");
  expect(within(tooltip).getByText("2026-11-08")).toBeInTheDocument();
  expect(within(tooltip).getByText("count : 6")).toBeInTheDocument();
  expect(tooltip.textContent).toMatch(/Other : 1Grey : 2Green : 3/);
  expect(within(tooltip).getByText("Other : 1")).toHaveStyle({
    color: "#000000",
  });
  expect(within(tooltip).queryByText("Red : 0")).not.toBeInTheDocument();
  expect(chart()).toHaveAttribute(
    "aria-describedby",
    expect.stringContaining(tooltip.id)
  );
  fireEvent.keyDown(chart(), { key: "ArrowLeft" });
  expect(screen.getByRole("tooltip")).toHaveTextContent("count : 1");
  fireEvent.keyDown(chart(), { key: "ArrowLeft" });
  expect(screen.getByRole("tooltip")).toHaveTextContent("count : 1");
  fireEvent.keyDown(chart(), { key: "ArrowRight" });
  expect(screen.getByRole("tooltip")).toHaveTextContent("count : 6");
  fireEvent.keyDown(chart(), { key: "Home" });
  expect(screen.getByRole("tooltip")).toHaveTextContent("2026-11-07");
  fireEvent.keyDown(chart(), { key: "End" });
  expect(screen.getByRole("tooltip")).toHaveTextContent("2026-11-08");
  fireEvent.keyDown(chart(), { key: "Escape" });
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  fireEvent.focus(chart());
  fireEvent.blur(chart());
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
});

test("selects the closest timestamp from pointer position, including scaled SVGs and touch taps", () => {
  render(<Climbing solvedHistory={history} />);
  vi.spyOn(chart(), "getBoundingClientRect").mockReturnValue({
    left: 20,
    width: 400,
  } as DOMRect);
  // jsdom has no PointerEvent constructor; use a mouse event with the pointer name.
  fireEvent(
    chart(),
    new MouseEvent("pointermove", { bubbles: true, clientX: 60 })
  );
  expect(screen.getByRole("tooltip")).toHaveTextContent("count : 1");
  fireEvent(
    chart(),
    new MouseEvent("pointerdown", { bubbles: true, clientX: 400 })
  );
  expect(screen.getByRole("tooltip")).toHaveTextContent("count : 6");
  const touchLeave = new Event("pointerout", { bubbles: true });
  Object.defineProperty(touchLeave, "pointerType", { value: "touch" });
  fireEvent(chart(), touchLeave);
  expect(screen.getByRole("tooltip")).toHaveTextContent("count : 6");
  fireEvent.pointerLeave(chart());
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
});

test("clears selection when a new user's history replaces the data", () => {
  const { rerender } = render(<Climbing solvedHistory={history} />);
  fireEvent.focus(chart());
  expect(screen.getByRole("tooltip")).toHaveTextContent("count : 6");
  rerender(<Climbing solvedHistory={[{ dateSecond, Red: 2 }]} />);
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  fireEvent.keyDown(chart(), { key: "Home" });
  expect(screen.getByRole("tooltip")).toHaveTextContent("count : 2");
});

test("renders empty and single-point histories without invalid geometry or dates", () => {
  const { container, rerender } = render(<Climbing solvedHistory={[]} />);
  expect(screen.getByText("No solved problems yet.")).toBeInTheDocument();
  expect(container.querySelector("[data-series]")).toBeNull();
  expect(chart()).not.toHaveAttribute("tabindex");
  fireEvent.keyDown(chart(), { key: "ArrowLeft" });
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  rerender(<Climbing solvedHistory={[{ dateSecond, Other: 1 }]} />);
  expect(screen.queryByText("No solved problems yet.")).not.toBeInTheDocument();
  fireEvent.focus(chart());
  expect(screen.getByRole("tooltip")).toHaveTextContent("Other : 1");
  expect(container.innerHTML).not.toMatch(/NaN|Infinity|Invalid Date/);
});

test("responds to width changes, uses fewer mobile date ticks and disconnects the observer", () => {
  let notify: ResizeObserverCallback | undefined;
  const disconnect = vi.fn();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: ResizeObserverCallback) {
        notify = callback;
      }
      observe() {}
      disconnect = disconnect;
    }
  );
  const { unmount } = render(
    <Climbing
      solvedHistory={[
        history[0],
        { ...history[1], dateSecond: dateSecond + 86400 * 365 },
      ]}
    />
  );
  const before = document.querySelectorAll(".climbing-axis text").length;
  React.act(() =>
    notify!(
      [{ contentRect: { width: 351 } } as ResizeObserverEntry],
      {} as ResizeObserver
    )
  );
  expect(chart()).toHaveAttribute("viewBox", "0 0 351 300");
  expect(document.querySelectorAll(".climbing-axis text").length).toBeLessThan(
    before
  );
  unmount();
  expect(disconnect).toHaveBeenCalled();
  vi.unstubAllGlobals();
});

test("uses nonnegative integer Y ticks covering the maximum", () => {
  for (const maximum of [0, 1, 6, 305, 10000]) {
    const ticks = yAxisTicks(maximum);
    expect(ticks[0]).toBe(0);
    expect(ticks.at(-1)).toBeGreaterThanOrEqual(Math.max(1, maximum));
    expect(ticks.every(Number.isInteger)).toBe(true);
    expect(ticks.length).toBeLessThanOrEqual(6);
  }
});

test("finds nearest dates across irregular gaps and clamps to the first/last point", () => {
  const points = [10, 20, 100].map((dateSecond) => ({ dateSecond }));
  for (const [time, expected] of [
    [0, 0],
    [10, 0],
    [15, 0],
    [19, 1],
    [21, 1],
    [61, 2],
    [1000, 2],
  ]) {
    expect(nearestPoint(points, time)).toBe(expected);
  }
});
