import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import TableTab from "./TableTab";

vi.mock("./ContestTable", () => ({
  default: (props: {
    name: string;
    isShowDifficulty: boolean;
    isReverseOrder: boolean;
    userId: string;
  }) => <output data-testid="table-props">{JSON.stringify(props)}</output>,
}));
beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  localStorage.clear();
});
const tableProps = () =>
  JSON.parse(screen.getByTestId("table-props").textContent!);

test("keeps defaults and passes category, difficulty, order and username to the table", () => {
  render(<TableTab userId="a_B.c-9" />);
  expect(screen.getAllByRole("radio")).toHaveLength(12);
  expect(screen.getByRole("radio", { name: "Educational" })).toBeChecked();
  expect(tableProps()).toEqual({
    name: "Educational Codeforces Rounds",
    isShowDifficulty: true,
    isReverseOrder: false,
    userId: "a_B.c-9",
  });
});

test("restores existing settings, persists changes and restores them on remount", () => {
  localStorage.setItem("activeTab", JSON.stringify("Div. 3 Contests"));
  localStorage.setItem("isShowDifficulty", "false");
  localStorage.setItem("isReverseOrder", "true");
  const { unmount } = render(<TableTab userId="alice" />);
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
    userId: "alice",
  });
  expect(localStorage.getItem("activeTab")).toBe(
    JSON.stringify("Codeforces Global Rounds")
  );
  expect(localStorage.getItem("isShowDifficulty")).toBe("true");
  expect(localStorage.getItem("isReverseOrder")).toBe("false");
  unmount();
  render(<TableTab userId="alice" />);
  expect(screen.getByRole("radio", { name: "Global" })).toBeChecked();
  expect(screen.getByRole("switch", { name: "Show Difficulty" })).toBeChecked();
  expect(
    screen.getByRole("switch", { name: "Reverse Order" })
  ).not.toBeChecked();
});
