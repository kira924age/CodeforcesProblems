import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import Tooltip, { TooltipProvider } from "./Tooltip";
import DifficultyCircle from "../DifficultyCircle";
import UserNameLabel from "../../pages/UserPage/UserNameLabel";

afterEach(cleanup);

test("opens on keyboard focus, describes the trigger, closes on Escape and blur", async () => {
  render(
    <TooltipProvider>
      <Tooltip title="Details">
        <span>?</span>
      </Tooltip>
      <button>Next</button>
    </TooltipProvider>
  );
  const trigger = screen.getByLabelText("Details");
  trigger.focus();
  const tooltip = await screen.findByRole("tooltip");
  expect(tooltip).toHaveTextContent("Details");
  expect(trigger).toHaveAttribute("aria-describedby", tooltip.id);
  fireEvent.keyDown(trigger, { key: "Escape" });
  await waitFor(() =>
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
  );
  screen.getByRole("button", { name: "Next" }).focus();
  trigger.focus();
  expect(await screen.findByRole("tooltip")).toBeInTheDocument();
  screen.getByRole("button", { name: "Next" }).focus();
  await waitFor(() =>
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
  );
});

test.each([
  [<DifficultyCircle rating={1800} />, "Difficulty :1800"],
  [<DifficultyCircle rating={undefined} />, "Difficulty is unavailable."],
  [<UserNameLabel userId="alice" rating={1800} />, "Rating: 1800"],
])("preserves the existing tooltip message (%s)", async (element, message) => {
  render(<TooltipProvider>{element}</TooltipProvider>);
  const trigger = screen.getByLabelText(message);
  trigger.focus();
  expect(await screen.findByRole("tooltip")).toHaveTextContent(message);
});
