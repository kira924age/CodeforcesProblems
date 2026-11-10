import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import TableTab from "./TableTab";

vi.mock("./ContestTable", () => ({
  default: (props: {
    name: string;
    isShowDifficulty: boolean;
    isReverseOrder: boolean;
    submissions: Map<string, boolean>;
    isFetchFailure: boolean;
  }) => (
    <output data-testid="table-props">
      {JSON.stringify({ ...props, submissions: [...props.submissions] })}
    </output>
  ),
}));
beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  localStorage.clear();
});
const status = {
  submissions: new Map([["2000A", true]]),
  isFetchFailure: false,
};
const tableProps = () =>
  JSON.parse(screen.getByTestId("table-props").textContent!);

test("keeps defaults and passes category, difficulty, order and submissions to the table", () => {
  render(<TableTab {...status} />);
  expect(screen.getAllByRole("radio")).toHaveLength(12);
  expect(screen.getByRole("radio", { name: "Educational" })).toBeChecked();
  expect(tableProps()).toEqual({
    name: "Educational Codeforces Rounds",
    isShowDifficulty: true,
    isReverseOrder: false,
    submissions: [["2000A", true]],
    isFetchFailure: false,
  });
});

test("restores existing settings, persists changes and restores them on remount", () => {
  localStorage.setItem("activeTab", JSON.stringify("Div. 3 Contests"));
  localStorage.setItem("isShowDifficulty", "false");
  localStorage.setItem("isReverseOrder", "true");
  const { unmount } = render(<TableTab {...status} />);
  expect(screen.getByRole("radio", { name: "Div3" })).toBeChecked();
  expect(
    screen.getByRole("switch", { name: "Show Difficulty" })
  ).not.toBeChecked();
  expect(screen.getByRole("switch", { name: "Reverse Order" })).toBeChecked();
  fireEvent.click(screen.getByRole("radio", { name: "Global" }));
  fireEvent.click(screen.getByRole("switch", { name: "Show Difficulty" }));
  fireEvent.click(screen.getByRole("switch", { name: "Reverse Order" }));
  expect(tableProps()).toEqual({
    name: "Codeforces Global Rounds",
    isShowDifficulty: true,
    isReverseOrder: false,
    submissions: [["2000A", true]],
    isFetchFailure: false,
  });
  expect(localStorage.getItem("activeTab")).toBe(
    JSON.stringify("Codeforces Global Rounds")
  );
  expect(localStorage.getItem("isShowDifficulty")).toBe("true");
  expect(localStorage.getItem("isReverseOrder")).toBe("false");
  unmount();
  render(<TableTab {...status} />);
  expect(screen.getByRole("radio", { name: "Global" })).toBeChecked();
  expect(screen.getByRole("switch", { name: "Show Difficulty" })).toBeChecked();
  expect(
    screen.getByRole("switch", { name: "Reverse Order" })
  ).not.toBeChecked();
});

test.each([
  ["Show Difficulty", "isShowDifficulty", true],
  ["Reverse Order", "isReverseOrder", false],
] as const)(
  "clicking the %s label toggles and persists its switch",
  (label, key, initial) => {
    render(<TableTab {...status} />);
    const toggle = screen.getByRole("switch", { name: label });
    fireEvent.click(screen.getByText(label));
    expect(toggle).toHaveAttribute("aria-checked", String(!initial));
    expect(tableProps()[key]).toBe(!initial);
    expect(localStorage.getItem(key)).toBe(String(!initial));
    fireEvent.click(screen.getByText(label));
    expect(toggle).toHaveAttribute("aria-checked", String(initial));
    expect(localStorage.getItem(key)).toBe(String(initial));
  }
);
