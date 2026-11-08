import React from "react";
import {
  cleanup,
  fireEvent,
  render as renderWithoutProvider,
  screen,
  within,
} from "@testing-library/react";
import SubmissionListTable from "./SubmissionListTable";

import { TooltipProvider } from "../../components/ui/Tooltip";
const render = (ui: React.ReactElement) =>
  renderWithoutProvider(ui, { wrapper: TooltipProvider });

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: () => ({ matches: false, addListener() {}, removeListener() {} }),
  });
});
afterEach(cleanup);

const submission = (index: number, verdict: string | undefined = "OK") => ({
  submissionId: 1000 + index,
  creationTimeSeconds: new Date(2026, 0, 2, 3, 4, 5).getTime() / 1000,
  problem: {
    contestId: 123,
    index: "A",
    name: `Problem ${index}`,
    rating: 1500,
  },
  verdict,
  programmingLanguage: "GNU C++20",
});
const history = (length: number) =>
  Array.from({ length }, (_, index) => submission(index + 1));
const rows = () =>
  within(screen.getByRole("table", { name: "Submissions" })).getAllByRole(
    "row"
  );

test("renders a native five-column table, the first ten submissions, and existing links and labels", () => {
  render(<SubmissionListTable submission={history(21)} />);
  expect(
    screen.getAllByRole("columnheader").map((cell) => cell.textContent)
  ).toEqual(["Date", "Problem", "Verdict", "Language", "Detail"]);
  for (const header of screen.getAllByRole("columnheader")) {
    expect(header).toHaveAttribute("scope", "col");
  }
  expect(rows()).toHaveLength(11);
  const first = within(rows()[1]);
  expect(first.getByText("2026-01-02 03:04:05")).toBeInTheDocument();
  expect(first.getByText("Accepted")).toHaveClass("verdict-accepted");
  expect(first.getByText("GNU C++20")).toBeInTheDocument();
  const problem = first.getByRole("link", { name: "A. Problem 1" });
  expect(problem).toHaveAttribute(
    "href",
    "https://codeforces.com/contest/123/problem/A"
  );
  expect(problem).toHaveClass("difficulty-cyan");
  const detail = first.getByRole("link", { name: "Detail" });
  expect(detail).toHaveAttribute(
    "href",
    "https://codeforces.com/contest/123/submission/1001"
  );
  for (const link of [problem, detail]) {
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  }
  expect(
    screen.queryByRole("link", { name: "A. Problem 11" })
  ).not.toBeInTheDocument();
});

test("moves between pages and renders only the requested page in the original order", () => {
  render(<SubmissionListTable submission={history(21)} />);
  expect(screen.getByRole("button", { name: "Previous Page" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Next Page" }));
  expect(
    within(rows()[1]).getByRole("link", { name: "A. Problem 11" })
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("link", { name: "A. Problem 1" })
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Next Page" }));
  expect(rows()).toHaveLength(2);
  expect(
    screen.getByRole("link", { name: "A. Problem 21" })
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Next Page" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Previous Page" }));
  expect(rows()).toHaveLength(11);
  expect(
    within(rows()[1]).getByRole("link", { name: "A. Problem 11" })
  ).toBeInTheDocument();
});

test("keeps the 10/20/50/100 size choices and changes page size through Ant Design Pagination", async () => {
  render(<SubmissionListTable submission={history(67)} />);
  fireEvent.click(screen.getByRole("button", { name: "Next Page" }));
  fireEvent.mouseDown(screen.getByRole("combobox", { name: "Page Size" }));
  for (const size of [10, 20, 50, 100]) {
    expect(
      await screen.findByText(`${size} / page`, {
        selector: ".ant-select-item-option-content",
      })
    ).toBeInTheDocument();
  }
  fireEvent.click(
    screen.getByText("20 / page", {
      selector: ".ant-select-item-option-content",
    })
  );
  expect(rows()).toHaveLength(21);
  // rc-pagination preserves page 2 when increasing the size.
  expect(
    within(rows()[1]).getByRole("link", { name: "A. Problem 21" })
  ).toBeInTheDocument();
});

test.each([50, 51])(
  "preserves automatic page-size selector visibility for %i submissions",
  (length) => {
    render(<SubmissionListTable submission={history(length)} />);
    expect(screen.queryByRole("combobox", { name: "Page Size" }) !== null).toBe(
      length > 50
    );
  }
);

test("clamps the current page when data shrinks, and hides pagination for an empty history", () => {
  const { rerender } = render(<SubmissionListTable submission={history(21)} />);
  fireEvent.click(screen.getByRole("button", { name: "Page 3" }));
  rerender(<SubmissionListTable submission={history(12)} />);
  expect(rows()).toHaveLength(3);
  expect(
    within(rows()[1]).getByRole("link", { name: "A. Problem 11" })
  ).toBeInTheDocument();
  rerender(<SubmissionListTable submission={[]} />);
  expect(screen.getByText("No data")).toBeInTheDocument();
  expect(screen.getAllByRole("columnheader")).toHaveLength(5);
  expect(
    screen.queryByRole("button", { name: "Next Page" })
  ).not.toBeInTheDocument();
  rerender(<SubmissionListTable submission={history(1)} />);
  expect(
    screen.getByRole("link", { name: "A. Problem 1" })
  ).toBeInTheDocument();
});

test.each([
  ["WRONG_ANSWER", "Wrong answer"],
  ["TIME_LIMIT_EXCEEDED", "Time limit exceeded"],
  ["COMPILATION_ERROR", "Compilation error"],
  ["MEMORY_LIMIT_EXCEEDED", "Memory limit exceeded"],
  ["RUNTIME_ERROR", "Runtime error"],
  ["PRESENTATION_ERROR", "Presentation error"],
  ["IDLENESS_LIMIT_EXCEEDED", "Idleness limit exceeded"],
])("retains the %s verdict label and color class", (verdict, label) => {
  render(<SubmissionListTable submission={[submission(1, verdict)]} />);
  expect(screen.getByText(label)).toHaveClass("verdict-rejected");
});

test("preserves missing and unfamiliar verdicts and unrated problems", () => {
  const entry = submission(1);
  const { rerender } = render(
    <SubmissionListTable
      submission={[
        {
          ...entry,
          verdict: undefined,
          problem: { ...entry.problem, rating: undefined },
        },
      ]}
    />
  );
  expect(screen.getByText("unknown")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "A. Problem 1" })).toHaveClass(
    "difficulty-black"
  );
  rerender(
    <SubmissionListTable submission={[{ ...entry, verdict: "TESTING" }]} />
  );
  expect(screen.getByText("TESTING")).toBeInTheDocument();
});
