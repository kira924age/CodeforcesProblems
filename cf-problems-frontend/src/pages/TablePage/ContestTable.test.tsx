import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import ContestTable from "./ContestTable";
import * as utils from "./contestTableUtils";
import { cachedUserSubmissions } from "../../utils/TypedCachedApiClient";

const contests = vi.hoisted(() => [
  ...Array.from({ length: 170 }, (_, i) => ({
    id: 2000 + i,
    name: `Round ${i + 1}`,
    type: "Educational",
    problems: [
      { index: "A1", name: `Easy ${i + 1}`, rating: 800 },
      { index: "A2", name: `Hard ${i + 1}`, rating: 2200 },
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
beforeAll(() =>
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: () => ({ matches: false, addListener() {}, removeListener() {} }),
  })
);
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
  userId: "",
};
const rows = () =>
  screen.getByRole("table", { name: props.name }).querySelectorAll("tr");

test("generates cells for only the first 50 contests, reusing the existing columns and multi-problem cells", () => {
  const makeRows = vi.spyOn(utils, "makeContestTable");
  render(<ContestTable {...props} />);
  expect(rows()).toHaveLength(51);
  expect(screen.getAllByRole("columnheader", { hidden: true })).toHaveLength(
    10
  );
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
  fireEvent.click(screen.getByRole("button", { name: "Next Page" }));
  expect(
    within(rows()[1] as HTMLElement).getByRole("link", { name: "Round 51" })
  ).toBeInTheDocument();
  expect(screen.queryByText("Round 1")).not.toBeInTheDocument();
  rerender(<ContestTable {...props} isReverseOrder />);
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
  fireEvent.mouseDown(screen.getByRole("combobox", { name: "Page Size" }));
  for (const size of [10, 20, 50, 100, 150])
    expect(
      await screen.findByText(`${size} / page`, {
        selector: ".ant-select-item-option-content",
      })
    ).toBeInTheDocument();
  fireEvent.click(
    screen.getByText("150 / page", {
      selector: ".ant-select-item-option-content",
    })
  );
  expect(rows()).toHaveLength(151);
  expect(localStorage.getItem("pageSize")).toBe("150");
});
test("clamps the page after changing categories and preserves Q# columns and unpopulated contests", () => {
  const { rerender } = render(<ContestTable {...props} />);
  fireEvent.click(screen.getByRole("button", { name: "Next Page" }));
  rerender(<ContestTable {...props} name="Div. 1 Contests" />);
  expect(screen.getAllByRole("columnheader", { hidden: true })).toHaveLength(8);
  expect(screen.getByRole("link", { name: "Division 1" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Next Page" })).toBeDisabled();
  rerender(<ContestTable {...props} name="Microsoft Q# Coding Contests" />);
  expect(screen.getByRole("columnheader", { name: "U" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "U. Quantum" })).toBeInTheDocument();
});
test("preserves AC/NG coloring, whole-contest completion, and difficulty toggling", async () => {
  localStorage.setItem("pageSize", "10");
  vi.mocked(cachedUserSubmissions).mockResolvedValue(
    new Map([
      ["2000A1", true],
      ["2000A2", false],
      ["2001A1", true],
      ["2001A2", true],
    ])
  );
  const { rerender } = render(<ContestTable {...props} userId="alice" />);
  await waitFor(() =>
    expect(
      within(rows()[1] as HTMLElement).getByRole("link", { name: "A1. Easy 1" })
        .parentElement
    ).toHaveClass("OK")
  );
  expect(
    within(rows()[1] as HTMLElement).getByRole("link", { name: "A2. Hard 1" })
      .parentElement
  ).toHaveClass("NG");
  expect(
    within(rows()[2] as HTMLElement).getByRole("link", { name: "Round 2" })
      .parentElement
  ).toHaveClass("OK");
  rerender(<ContestTable {...props} userId="alice" isShowDifficulty={false} />);
  expect(
    within(rows()[1] as HTMLElement).getByRole("link", { name: "A1. Easy 1" })
  ).toHaveClass("difficulty-black");
  expect(document.querySelector(".common-difficulty-circle")).toBeNull();
});
test("preserves empty results and submission fetch failure display", async () => {
  localStorage.setItem("pageSize", "10");
  const { rerender } = render(<ContestTable {...props} name="unknown" />);
  expect(screen.getByText("No data")).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Next Page" })
  ).not.toBeInTheDocument();
  vi.mocked(cachedUserSubmissions).mockResolvedValue(null);
  rerender(<ContestTable {...props} userId="missing" />);
  expect(
    await screen.findByText(/Failure to fetch submissions data/)
  ).toBeInTheDocument();
  expect(
    within(rows()[1] as HTMLElement).getByRole("link", { name: "Round 1" })
  ).toBeInTheDocument();
});
