import React from "react";
import {
  cleanup,
  fireEvent,
  render as renderWithoutProvider,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import TablePage from "./index";
import ContestTable from "./ContestTable";
import * as utils from "./contestTableUtils";
import { cachedUserSubmissions } from "../../utils/TypedCachedApiClient";

import { TooltipProvider } from "../../components/ui/Tooltip";
const render = (ui: React.ReactElement) =>
  renderWithoutProvider(ui, { wrapper: TooltipProvider });

const contests = vi.hoisted(() => [
  ...Array.from({ length: 170 }, (_, i) => ({
    id: 2000 + i,
    name: `Round ${i + 1}`,
    type: "Educational",
    problems: [
      { index: "A1", name: `Easy ${i + 1}`, rating: 800 },
      { index: "A2", name: `Hard ${i + 1}`, rating: 2200 },
      ...(i === 50 ? [{ index: "B", name: "Bonus", rating: 1600 }] : []),
    ],
  })),
  { id: 3000, name: "Division 1", type: "Div1", problems: null },
  {
    id: 4000,
    name: "Q Contest",
    type: "Q#",
    problems: [{ index: "U", name: "Quantum", rating: 1500 }],
  },
]);
vi.mock("../../utils/TypedCachedApiClient", () => ({
  cachedContestArray: () => contests,
  cachedUserSubmissions: vi.fn(),
}));
beforeEach(() => {
  localStorage.clear();
  vi.mocked(cachedUserSubmissions).mockResolvedValue(new Map());
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
const props = {
  name: "Educational Codeforces Rounds",
  isShowDifficulty: true,
  isReverseOrder: false,
  submissions: new Map<string, boolean>(),
  isFetchFailure: false,
};
const rows = () =>
  screen.getByRole("table", { name: props.name }).querySelectorAll("tr");

test("enables Refresh with an applied handle and reloads its submissions", async () => {
  const { rerender } = render(<TablePage userId="" onUserIdChange={vi.fn()} />);
  const refresh = screen.getByRole("button", { name: "Refresh" });
  expect(refresh).toBeDisabled();

  rerender(<TablePage userId="alice" onUserIdChange={vi.fn()} />);
  await waitFor(() => expect(refresh).toBeEnabled());
  fireEvent.click(refresh);
  expect(cachedUserSubmissions).toHaveBeenLastCalledWith("alice", true);
  await waitFor(() => expect(refresh).toBeEnabled());
});

test("generates cells for only the first 50 contests, reusing the existing columns and multi-problem cells", () => {
  const makeRows = vi.spyOn(utils, "makeContestTable");
  render(<ContestTable {...props} />);
  expect(rows()).toHaveLength(51);
  expect(screen.getAllByRole("columnheader", { hidden: true })).toHaveLength(2);
  expect(makeRows).toHaveBeenCalled();
  for (const call of makeRows.mock.calls) expect(call[0]).toHaveLength(50);
  const first = within(rows()[1] as HTMLElement);
  expect(first.getByRole("link", { name: "Round 1" })).toHaveAttribute(
    "href",
    "https://codeforces.com/contest/2000"
  );
  expect(first.getByRole("link", { name: "A1. Easy 1" })).toHaveClass(
    "difficulty-grey"
  );
  expect(first.getByRole("link", { name: "A2. Hard 1" })).toHaveClass(
    "difficulty-orange"
  );
  expect(screen.queryByText("Round 51")).not.toBeInTheDocument();
});
test("paginates before generating cells and retains the selected page on order changes", () => {
  const { rerender } = render(<ContestTable {...props} />);
  expect(screen.queryByRole("columnheader", { name: "B" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Next Page" }));
  expect(screen.getByRole("columnheader", { name: "B" })).toBeInTheDocument();
  expect(
    within(rows()[1] as HTMLElement).getByRole("link", { name: "Round 51" })
  ).toBeInTheDocument();
  expect(screen.queryByText("Round 1")).not.toBeInTheDocument();
  rerender(<ContestTable {...props} isReverseOrder />);
  expect(screen.queryByRole("columnheader", { name: "B" })).toBeNull();
  expect(
    within(rows()[1] as HTMLElement).getByRole("link", { name: "Round 120" })
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Page 4" }));
  expect(rows()).toHaveLength(21);
});
test("uses the saved size and persists changes including the 150-row option", async () => {
  localStorage.setItem("pageSize", "20");
  render(<ContestTable {...props} />);
  expect(rows()).toHaveLength(21);
  fireEvent.keyDown(screen.getByRole("combobox", { name: "Page Size" }), {
    key: "ArrowDown",
  });
  for (const size of [10, 20, 50, 100, 150])
    expect(
      await screen.findByRole("option", { name: `${size} / page` })
    ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("option", { name: "150 / page" }));
  expect(rows()).toHaveLength(151);
  expect(localStorage.getItem("pageSize")).toBe("150");
});
test("clamps the page after changing categories and preserves Q# columns and unpopulated contests", () => {
  const { rerender } = render(<ContestTable {...props} />);
  fireEvent.click(screen.getByRole("button", { name: "Next Page" }));
  rerender(<ContestTable {...props} name="Div. 1 Contests" />);
  expect(screen.getAllByRole("columnheader", { hidden: true })).toHaveLength(1);
  expect(screen.getByRole("link", { name: "Division 1" })).toBeInTheDocument();
  expect(screen.getByRole("combobox", { name: "Page Size" })).toBeVisible();
  expect(screen.getByRole("button", { name: "Next Page" })).toBeDisabled();
  rerender(<ContestTable {...props} name="Microsoft Q# Coding Contests" />);
  expect(screen.getByRole("columnheader", { name: "U" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "U. Quantum" })).toBeInTheDocument();
});
test("preserves AC/NG coloring, whole-contest completion, and difficulty toggling", () => {
  localStorage.setItem("pageSize", "10");
  const submissions = new Map([
    ["2000A1", true],
    ["2000A2", false],
    ["2001A1", true],
    ["2001A2", true],
  ]);
  const { rerender } = render(
    <ContestTable {...props} submissions={submissions} />
  );
  expect(
    within(rows()[1] as HTMLElement).getByRole("link", { name: "A1. Easy 1" })
      .parentElement
  ).toHaveClass("OK");
  expect(
    within(rows()[1] as HTMLElement).getByRole("link", { name: "A2. Hard 1" })
      .parentElement
  ).toHaveClass("NG");
  expect(
    within(rows()[2] as HTMLElement).getByRole("link", { name: "Round 2" })
      .parentElement
  ).toHaveClass("OK");
  rerender(
    <ContestTable
      {...props}
      submissions={submissions}
      isShowDifficulty={false}
    />
  );
  expect(
    within(rows()[1] as HTMLElement).getByRole("link", { name: "A1. Easy 1" })
  ).toHaveClass("difficulty-black");
  expect(document.querySelector(".common-difficulty-circle")).toBeNull();
});
test("preserves empty results and submission fetch failure display", () => {
  localStorage.setItem("pageSize", "10");
  const { rerender } = render(<ContestTable {...props} name="unknown" />);
  expect(screen.getByText("No data")).toBeInTheDocument();
  expect(screen.getByRole("combobox", { name: "Page Size" })).toBeVisible();
  expect(
    screen.queryByRole("button", { name: "Next Page" })
  ).not.toBeInTheDocument();
  rerender(<ContestTable {...props} isFetchFailure />);
  expect(
    screen.getByText(/Failure to fetch submissions data/)
  ).toBeInTheDocument();
  expect(
    within(rows()[1] as HTMLElement).getByRole("link", { name: "Round 1" })
  ).toBeInTheDocument();
});

test("restores the saved size after remount and keeps the previous requested page after category changes", () => {
  localStorage.setItem("pageSize", "20");
  const { rerender, unmount } = render(<ContestTable {...props} />);
  fireEvent.click(screen.getByRole("button", { name: "Page 3" }));
  rerender(<ContestTable {...props} name="Div. 1 Contests" />);
  expect(screen.getByRole("button", { name: "Page 1" })).toHaveAttribute(
    "aria-current",
    "page"
  );
  rerender(<ContestTable {...props} />);
  expect(screen.getByRole("button", { name: "Page 3" })).toHaveAttribute(
    "aria-current",
    "page"
  );
  unmount();
  render(<ContestTable {...props} />);
  expect(rows()).toHaveLength(21);
  expect(screen.getByRole("button", { name: "Page 1" })).toHaveAttribute(
    "aria-current",
    "page"
  );
});
