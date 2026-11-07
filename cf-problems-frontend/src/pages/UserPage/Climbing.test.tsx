import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import Climbing from "./Climbing";
import { CustomTooltip } from "./CustomTooltip";

// Supply dimensions absent in jsdom, retaining the actual Recharts chart.
vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");
  return {
    ...actual,
    ResponsiveContainer: (
      props: React.ComponentProps<typeof actual.ResponsiveContainer>
    ) => {
      if (
        !React.isValidElement<React.ComponentProps<typeof actual.AreaChart>>(
          props.children
        )
      ) {
        throw new Error("Expected a chart element");
      }
      return React.cloneElement(props.children, { width: 800, height: 300 });
    },
  };
});
afterEach(cleanup);
const dateSecond = new Date(2026, 10, 8).getTime() / 1000;

test("renders the stacked chart and axes with actual Recharts components", async () => {
  const { container } = render(
    <Climbing
      solvedHistory={[
        { dateSecond: dateSecond - 86400, Grey: 1, Green: 0, Other: 0 },
        { dateSecond, Grey: 2, Green: 3, Other: 1 },
      ]}
    />
  );
  expect(screen.getByRole("heading", { name: "Climbing" })).toBeInTheDocument();
  expect(await screen.findByRole("application")).toBeInTheDocument();
  expect(container.querySelector(".recharts-area-area")).not.toBeNull();
  expect(screen.getByText("2026-11-08")).toBeInTheDocument();
});

test("handles an empty history without invalid date labels", () => {
  const { container } = render(<Climbing solvedHistory={[]} />);
  expect(container.textContent).not.toMatch(/NaN|Invalid Date/);
  expect(container.querySelector(".recharts-area-area")).toBeNull();
});

test("shows the date, total and difficulty counts in stack order, including Other", () => {
  const { container } = render(
    <CustomTooltip
      active
      label={String(dateSecond)}
      payload={[
        { graphicalItemId: "green", dataKey: "Green", value: 3 },
        { graphicalItemId: "other", dataKey: "Other", value: 1 },
        { graphicalItemId: "red", dataKey: "Red", value: 0 },
        { graphicalItemId: "grey", dataKey: "Grey", value: 2 },
      ]}
    />
  );
  expect(screen.getByText("2026-11-08")).toBeInTheDocument();
  expect(
    container.querySelector(".recharts-tooltip-item-value")
  ).toHaveTextContent("6");
  expect(screen.getByText("Other : 1")).toHaveStyle({ color: "#000000" });
  expect(container.textContent).toMatch(/Other : 1Grey : 2Green : 3/);
  expect(screen.queryByText("Red : 0")).not.toBeInTheDocument();
});

test("hides an inactive tooltip or one with no date", () => {
  const { container, rerender } = render(
    <CustomTooltip active={false} payload={[]} label={dateSecond} />
  );
  expect(container).toBeEmptyDOMElement();
  rerender(<CustomTooltip active payload={[]} />);
  expect(container).toBeEmptyDOMElement();
});
