import { cleanup, render, screen } from "@testing-library/react";
import ErrorMessage from "../../pages/TablePage/ErrorMessage";
import UserNotFound from "../../pages/UserPage/UserNotFound";
import Loading from "../../pages/UserPage/Loading";
import EmptyState from "./EmptyState";

afterEach(cleanup);

test("keeps the exact fetch failure and missing-user messages as alerts", () => {
  const { container } = render(
    <>
      <ErrorMessage />
      <UserNotFound />
    </>
  );
  const alerts = screen.getAllByRole("alert");
  expect(alerts[0]).toHaveTextContent(
    "Failure to fetch submissions data. Codeforces is down now or you may mistyped."
  );
  expect(alerts[1]).toHaveTextContent("User not found!");
  expect(container.querySelector(".ant-alert")).toBeNull();
});

test("announces loading without visible text and removes the status when unmounted", () => {
  const { container, unmount } = render(<Loading />);
  const status = screen.getByRole("status", { name: "Loading" });
  expect(status).toHaveAttribute("aria-live", "polite");
  expect(status).toHaveAttribute("aria-busy", "true");
  expect(status.textContent).toBe("");
  expect(status.querySelector('[aria-hidden="true"]')).not.toBeNull();
  expect(container.querySelector(".ant-spin")).toBeNull();
  unmount();
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});

test("keeps No data with a decorative illustration without repeating the message for screen readers", () => {
  const { container } = render(<EmptyState />);
  expect(screen.getAllByText("No data")).toHaveLength(1);
  expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  expect(container.querySelector("svg")).toHaveAttribute("focusable", "false");
  expect(container.querySelector(".ant-empty")).toBeNull();
});
