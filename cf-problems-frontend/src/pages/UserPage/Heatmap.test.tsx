import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import Heatmap from "./Heatmap";
import { ThemeContext } from "../../components/ThemeProvider";
import {
  calendarDays,
  colorDomain,
  dayColor,
  emptyDayColor,
  heatmapColors,
} from "./heatmapUtils";

beforeAll(() =>
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: () => ({ matches: false, addListener() {}, removeListener() {} }),
  })
);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const data = [
  { day: "2025-04-10", value: 13 },
  { day: "2026-03-11", value: 4 },
  { day: "2026-06-12", value: 1 },
];
const chart = () => screen.getByRole("img", { name: /Submission heatmap/ });
const cell = (day: string) =>
  document.querySelector(`rect[data-day="${day}"]`)!;

test("handles an empty history without rendering a calendar or year selector", () => {
  const { container } = render(<Heatmap data={[]} />);
  expect(screen.getByText("No submissions yet.")).toBeInTheDocument();
  expect(container.querySelector("svg")).toBeNull();
  expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
});

test("defaults to the latest year, renders every day and all month labels, and selects another year", async () => {
  render(<Heatmap data={data} />);
  expect(chart()).toHaveAccessibleName("Submission heatmap for 2026");
  expect(document.querySelectorAll("[data-day]")).toHaveLength(365);
  for (const month of [
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
  ])
    expect(screen.getByText(month)).toBeInTheDocument();
  expect(cell("2026-03-11")).toHaveAttribute("data-value", "4");
  expect(cell("2026-01-01")).toHaveAttribute("fill", emptyDayColor);
  fireEvent.mouseDown(screen.getByRole("combobox", { name: "Heatmap year" }));
  fireEvent.click(
    await screen.findByText("2025", {
      selector: ".ant-select-item-option-content",
    })
  );
  expect(chart()).toHaveAccessibleName("Submission heatmap for 2025");
  expect(cell("2025-04-10")).toHaveAttribute("data-value", "13");
  expect(document.querySelector('[data-day="2026-03-11"]')).toBeNull();
});

test("uses the entire history for color thresholds, preserving colors across year selection", async () => {
  render(<Heatmap data={data} />);
  // Global domain [1,13] has boundaries 4,7,10; selected year's [1,4] must not be used.
  expect(cell("2026-03-11")).toHaveAttribute("fill", heatmapColors[1]);
  expect(cell("2026-06-12")).toHaveAttribute("fill", heatmapColors[0]);
  expect(screen.getAllByRole("listitem")).toHaveLength(4);
  fireEvent.mouseDown(screen.getByRole("combobox", { name: "Heatmap year" }));
  fireEvent.click(
    await screen.findByText("2025", {
      selector: ".ant-select-item-option-content",
    })
  );
  expect(cell("2025-04-10")).toHaveAttribute("fill", heatmapColors[3]);
});

test.each([
  ["light", "#333", "#fff"],
  ["dark", "#fff", "#333"],
] as const)(
  "applies the %s text and day-border theme",
  (theme, text, border) => {
    const { container } = render(
      <ThemeContext.Provider value={[theme, () => {}]}>
        <Heatmap data={data} />
      </ThemeContext.Provider>
    );
    expect(container.querySelector(".heatmap-labels")).toHaveAttribute(
      "fill",
      text
    );
    expect(cell("2026-03-11")).toHaveAttribute("stroke", border);
  }
);

test("shows the exact date and submissions on hover and keeps a tooltip after touch release", () => {
  render(<Heatmap data={data} />);
  fireEvent.pointerMove(cell("2026-03-11"));
  expect(screen.getByRole("tooltip")).toHaveTextContent("2026-03-11");
  expect(screen.getByRole("tooltip")).toHaveTextContent("4 submissions");
  const tap = new MouseEvent("pointerdown", { bubbles: true });
  Object.defineProperty(tap, "pointerType", { value: "touch" });
  fireEvent(cell("2026-06-12"), tap);
  expect(chart()).toHaveAttribute("data-keyboard-focus", "false");
  const leave = new Event("pointerout", { bubbles: true });
  Object.defineProperty(leave, "pointerType", { value: "touch" });
  fireEvent(chart(), leave);
  expect(screen.getByRole("tooltip")).toHaveTextContent("2026-06-12");
  fireEvent.pointerLeave(chart());
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
});

test("supports day/week keyboard navigation, bounds, zero days, and dismissal", () => {
  render(<Heatmap data={data} />);
  fireEvent.focus(chart());
  expect(chart()).toHaveAttribute("data-keyboard-focus", "true");
  expect(screen.getByRole("tooltip")).toHaveTextContent("2026-06-12");
  expect(chart()).toHaveAttribute(
    "aria-describedby",
    expect.stringContaining(screen.getByRole("tooltip").id)
  );
  fireEvent.keyDown(chart(), { key: "ArrowUp" });
  expect(screen.getByRole("tooltip")).toHaveTextContent("2026-06-11");
  fireEvent.keyDown(chart(), { key: "ArrowDown" });
  expect(screen.getByRole("tooltip")).toHaveTextContent("2026-06-12");
  fireEvent.keyDown(chart(), { key: "ArrowLeft" });
  expect(screen.getByRole("tooltip")).toHaveTextContent("2026-06-05");
  fireEvent.keyDown(chart(), { key: "ArrowRight" });
  expect(screen.getByRole("tooltip")).toHaveTextContent("2026-06-12");
  fireEvent.keyDown(chart(), { key: "Home" });
  fireEvent.keyDown(chart(), { key: "ArrowLeft" });
  expect(screen.getByRole("tooltip")).toHaveTextContent("2026-01-01");
  expect(screen.getByRole("tooltip")).toHaveTextContent("0 submissions");
  fireEvent.keyDown(chart(), { key: "End" });
  fireEvent.keyDown(chart(), { key: "ArrowDown" });
  expect(screen.getByRole("tooltip")).toHaveTextContent("2026-12-31");
  fireEvent.keyDown(chart(), { key: "Escape" });
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  fireEvent.focus(chart());
  fireEvent.blur(chart());
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
});

test("clears stale tooltips on year/data changes, preserves valid year selection, and falls back after a user change", async () => {
  const { rerender } = render(<Heatmap data={data} />);
  fireEvent.focus(chart());
  fireEvent.mouseDown(screen.getByRole("combobox", { name: "Heatmap year" }));
  fireEvent.click(
    await screen.findByText("2025", {
      selector: ".ant-select-item-option-content",
    })
  );
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  rerender(<Heatmap data={[...data, { day: "2027-01-01", value: 2 }]} />);
  expect(chart()).toHaveAccessibleName("Submission heatmap for 2025");
  fireEvent.focus(chart());
  rerender(<Heatmap data={[{ day: "2024-02-29", value: 1 }]} />);
  expect(chart()).toHaveAccessibleName("Submission heatmap for 2024");
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  expect(document.querySelectorAll("[data-day]")).toHaveLength(366);
  expect(cell("2024-02-29")).toHaveAttribute("fill", heatmapColors[3]);
  rerender(<Heatmap data={[]} />);
  expect(screen.getByText("No submissions yet.")).toBeInTheDocument();
});

test("resizes the SVG without dropping dates and disconnects the observer", () => {
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
  const { unmount } = render(<Heatmap data={data} />);
  React.act(() =>
    notify!(
      [{ contentRect: { width: 351 } } as ResizeObserverEntry],
      {} as ResizeObserver
    )
  );
  expect(chart()).toHaveAttribute("viewBox", "0 0 351 300");
  expect(document.querySelectorAll("[data-day]")).toHaveLength(365);
  expect(cell("2026-12-31")).not.toHaveAttribute("x", "NaN");
  unmount();
  expect(disconnect).toHaveBeenCalled();
});

test("generates Sunday-first weeks, leap days and year boundaries without timezone shifts", () => {
  const leap = calendarDays("2024");
  expect(leap).toHaveLength(366);
  expect(leap[0]).toEqual({
    day: "2024-01-01",
    weekday: 1,
    column: 0,
    month: 0,
  });
  expect(leap.find((d) => d.day === "2024-01-07")).toMatchObject({
    weekday: 0,
    column: 1,
  });
  expect(leap.find((d) => d.day === "2024-02-29")).toMatchObject({
    weekday: 4,
    month: 1,
  });
  expect(leap.at(-1)?.day).toBe("2024-12-31");
  expect(calendarDays("2023")).toHaveLength(365);
  expect(calendarDays("2023")[0]).toMatchObject({ weekday: 0, column: 0 });
  expect(calendarDays("1900")).toHaveLength(365);
  expect(calendarDays("2000")).toHaveLength(366);
  expect(leap.filter((d) => d.month === 2)).toHaveLength(31);
  expect(leap.filter((d) => d.month === 10)).toHaveLength(30);
});

test("matches quantize boundaries, empty days and a constant-value domain", () => {
  const domain = colorDomain(data);
  expect(domain).toEqual([1, 13]);
  expect([1, 3, 4, 6, 7, 9, 10, 13].map((v) => dayColor(v, domain))).toEqual([
    heatmapColors[0],
    heatmapColors[0],
    heatmapColors[1],
    heatmapColors[1],
    heatmapColors[2],
    heatmapColors[2],
    heatmapColors[3],
    heatmapColors[3],
  ]);
  expect(dayColor(undefined, domain)).toBe(emptyDayColor);
  expect(dayColor(2, [2, 2])).toBe(heatmapColors[3]);
});
