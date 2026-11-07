import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import Heatmap from "./Heatmap";
import { ThemeContext } from "../../components/ThemeProvider";

// Supply fixed dimensions in jsdom, but render the actual Nivo Calendar.
vi.mock("@nivo/calendar", async () => {
  const actual = await vi.importActual<typeof import("@nivo/calendar")>(
    "@nivo/calendar"
  );
  return {
    ...actual,
    ResponsiveCalendar: (
      props: React.ComponentProps<typeof actual.ResponsiveCalendar>
    ) => <actual.Calendar {...props} width={850} height={240} />,
  };
});

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: () => ({ matches: false, addListener() {}, removeListener() {} }),
  });
});
afterEach(cleanup);
const data = [
  { day: "2025-04-10", value: 2 },
  { day: "2026-03-11", value: 3 },
];

test("handles an empty submission history without rendering an invalid date range", () => {
  const { container } = render(<Heatmap data={[]} />);
  expect(screen.getByText("No submissions yet.")).toBeInTheDocument();
  expect(container.querySelector("svg")).toBeNull();
});

test("defaults to the latest year and updates the real calendar when selecting another year", async () => {
  const { container } = render(<Heatmap data={data} />);
  expect(
    screen.getByText("2026", { selector: "svg text" })
  ).toBeInTheDocument();
  fireEvent.mouseDown(
    screen
      .getByRole("combobox", { name: "Heatmap year" })
      .closest(".ant-select")!
      .querySelector(".ant-select-selector")!
  );
  fireEvent.click(
    await screen.findByText("2025", {
      selector: ".ant-select-item-option-content",
    })
  );
  expect(
    screen.getByText("2025", { selector: "svg text" })
  ).toBeInTheDocument();
});

test.each([
  ["light", "#333"],
  ["dark", "#fff"],
] as const)("applies the %s text theme to Nivo", (theme, color) => {
  const { container } = render(
    <ThemeContext.Provider value={[theme, () => {}]}>
      <Heatmap data={data} />
    </ThemeContext.Provider>
  );
  const text = container.querySelector("svg text");
  expect(text).not.toBeNull();
  expect(text?.getAttribute("style")).toContain(`fill: ${color}`);
});

test("uses a valid year after the user history changes", () => {
  const { container, rerender } = render(<Heatmap data={data} />);
  rerender(<Heatmap data={[{ day: "2024-01-02", value: 1 }]} />);
  expect(
    screen.getByText("2024", { selector: "svg text" })
  ).toBeInTheDocument();
  rerender(<Heatmap data={[]} />);
  expect(screen.getByText("No submissions yet.")).toBeInTheDocument();
});
