import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import Pagination from "./Pagination";

afterEach(cleanup);
const props = { current: 1, pageSize: 10, total: 200, onChange: vi.fn() };
const pages = () =>
  screen
    .getAllByRole("button", { name: /^Page \d+$/ })
    .map((b) => b.textContent);
test.each([
  [1, ["1", "2", "3", "4", "5", "20"]],
  [4, ["1", "2", "3", "4", "5", "20"]],
  [5, ["1", "4", "5", "6", "20"]],
  [10, ["1", "9", "10", "11", "20"]],
  [17, ["1", "16", "17", "18", "19", "20"]],
  [20, ["1", "16", "17", "18", "19", "20"]],
])("keeps the page window at page %i", (current, expected) => {
  render(<Pagination {...props} current={current} />);
  expect(pages()).toEqual(expected);
  expect(
    screen.getByRole("button", { name: `Page ${current}` })
  ).toHaveAttribute("aria-current", "page");
});
test("keeps all seven pages without jumps and disables the end controls", () => {
  const { rerender } = render(<Pagination {...props} total={70} />);
  expect(pages()).toEqual(["1", "2", "3", "4", "5", "6", "7"]);
  expect(
    screen.queryByRole("button", { name: "Next 5 Pages" })
  ).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Previous Page" })).toBeDisabled();
  rerender(<Pagination {...props} total={70} current={7} />);
  expect(screen.getByRole("button", { name: "Next Page" })).toBeDisabled();
});
test("moves by five pages, clamps jumps at the ends, and ignores the active page", () => {
  const onChange = vi.fn();
  const { rerender } = render(
    <Pagination {...props} current={10} onChange={onChange} />
  );
  fireEvent.click(screen.getByRole("button", { name: "Previous 5 Pages" }));
  expect(onChange).toHaveBeenLastCalledWith(5, 10);
  fireEvent.click(screen.getByRole("button", { name: "Next 5 Pages" }));
  expect(onChange).toHaveBeenLastCalledWith(15, 10);
  fireEvent.click(screen.getByRole("button", { name: "Page 10" }));
  expect(onChange).toHaveBeenCalledTimes(2);
  rerender(<Pagination {...props} current={5} onChange={onChange} />);
  fireEvent.click(screen.getByRole("button", { name: "Previous 5 Pages" }));
  expect(onChange).toHaveBeenLastCalledWith(1, 10);
  rerender(<Pagination {...props} current={16} onChange={onChange} />);
  fireEvent.click(screen.getByRole("button", { name: "Next 5 Pages" }));
  expect(onChange).toHaveBeenLastCalledWith(20, 10);
});
test.each([
  [2, 20, 2],
  [20, 50, 4],
])(
  "keeps or clamps page %i after selecting %i per page",
  async (current, size, next) => {
    const onChange = vi.fn();
    render(<Pagination {...props} current={current} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole("combobox", { name: "Page Size" }), {
      key: "ArrowDown",
    });
    fireEvent.click(
      await screen.findByRole("option", { name: `${size} / page` })
    );
    expect(onChange).toHaveBeenCalledExactlyOnceWith(next, size);
  }
);
test("keeps nonstandard saved sizes available and ignores reselecting the current size", async () => {
  const onChange = vi.fn();
  render(<Pagination {...props} pageSize={30} onChange={onChange} />);
  fireEvent.keyDown(screen.getByRole("combobox", { name: "Page Size" }), {
    key: "ArrowDown",
  });
  const options = await screen.findAllByRole("option");
  expect(options.map((e) => e.textContent)).toEqual([
    "10 / page",
    "20 / page",
    "30 / page",
    "50 / page",
    "100 / page",
  ]);
  fireEvent.click(screen.getByRole("option", { name: "30 / page" }));
  await waitFor(() =>
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
  );
  expect(onChange).not.toHaveBeenCalled();
});
test.each([0, 1, 50, 51])(
  "keeps empty and size-selector behavior for %i items",
  (total) => {
    render(<Pagination {...props} total={total} />);
    expect(screen.queryByRole("navigation") !== null).toBe(total > 0);
    expect(screen.queryByRole("combobox") !== null).toBe(total > 50);
  }
);
