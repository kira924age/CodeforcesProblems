import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import Select from "./Select";

afterEach(cleanup);
const Year = () => {
  const [value, setValue] = React.useState("2026");
  return (
    <Select
      label="Year"
      value={value}
      options={["2026", "2025", "2024"]}
      onValueChange={setValue}
    />
  );
};
test("preserves option order, selects with the keyboard and restores trigger focus", async () => {
  render(<Year />);
  const trigger = screen.getByRole("combobox", { name: "Year" });
  trigger.focus();
  fireEvent.keyDown(trigger, { key: "ArrowDown" });
  const options = await screen.findAllByRole("option");
  expect(options.map((x) => x.textContent)).toEqual(["2026", "2025", "2024"]);
  await waitFor(() => expect(options[0]).toHaveFocus());
  fireEvent.keyDown(options[0], { key: "ArrowDown" });
  await waitFor(() => expect(options[1]).toHaveFocus());
  fireEvent.keyDown(options[1], { key: "Enter" });
  await waitFor(() => expect(trigger).toHaveTextContent("2025"));
  await waitFor(() => expect(trigger).toHaveFocus());
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
});
test("Escape cancels without changing the selected year and restores focus", async () => {
  render(<Year />);
  const trigger = screen.getByRole("combobox", { name: "Year" });
  fireEvent.keyDown(trigger, { key: "Enter" });
  const option = await screen.findByRole("option", { name: "2024" });
  option.focus();
  fireEvent.keyDown(option, { key: "Escape" });
  await waitFor(() => expect(trigger).toHaveFocus());
  expect(trigger).toHaveTextContent("2026");
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
});
