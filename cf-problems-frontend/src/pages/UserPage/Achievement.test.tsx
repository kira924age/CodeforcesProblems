import React from "react";
import {
  cleanup,
  fireEvent,
  render as renderWithoutProvider,
  screen,
  within,
} from "@testing-library/react";
import Achievement from "./Achievement";
import { TooltipProvider } from "../../components/ui/Tooltip";
const render = (ui: React.ReactElement) =>
  renderWithoutProvider(ui, { wrapper: TooltipProvider });

afterEach(cleanup);
const props = {
  userId: "alice",
  solvedCountAll: 305,
  solvedCountLastYear: 12,
  solvedCountLastMonth: 5,
  longestStreak: 8,
  currentStreak: 3,
  streakSum: 135,
};

test("keeps the six labels, values and their existing two row groups using native elements", () => {
  const { container, rerender } = render(<Achievement {...props} />);
  const groups = [...container.querySelectorAll(".achievement-row")];
  expect(groups).toHaveLength(2);
  const items = [...container.querySelectorAll(".achievement-item")];
  expect(items.map((item) => item.querySelector("h6")?.textContent)).toEqual([
    "solved for all time",
    "solved in the previous calendar year",
    "solved in the previous calendar month",
    "Longest Streak",
    "Current Streak",
    "Streak Sum",
  ]);
  expect(items.map((item) => item.querySelector("h4")?.textContent)).toEqual([
    "305 problems",
    "12 problems",
    "5 problems",
    "8 days",
    "3 days",
    "135 days",
  ]);
  for (const group of groups) {
    expect(group.tagName).toBe("DIV");
    expect(group.children).toHaveLength(3);
  }
  expect(container.querySelector(".ant-row,.ant-col,.ant-badge")).toBeNull();
  rerender(<Achievement {...props} solvedCountAll={0} currentStreak={0} />);
  expect(
    within(items[0] as HTMLElement).getByText("0 problems")
  ).toBeInTheDocument();
  expect(
    within(items[4] as HTMLElement).getByText("0 days")
  ).toBeInTheDocument();
});

test("retains the question marker and its explanation tooltip", async () => {
  render(<Achievement {...props} />);
  const marker = screen.getByRole("img", {
    name: "About achievement calculations",
  });
  expect(marker.tagName).toBe("SPAN");
  expect(marker).toHaveTextContent("?");
  fireEvent.focus(marker.closest(".ui-tooltip-trigger")!);
  const tooltip = await screen.findByRole("tooltip");
  expect(tooltip).toHaveTextContent(
    "Counts and streaks use the first AC of each problem in your local time."
  );
  expect(tooltip).toHaveTextContent("Repeat ACs do not count.");
  expect(tooltip).toHaveTextContent(
    "Previous month/year means the previous calendar month/year."
  );
});
