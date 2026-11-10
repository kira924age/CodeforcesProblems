import React from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import App from "./App";
import HandleForm from "./components/HandleForm";
import { cachedContestArray } from "./utils/TypedCachedApiClient";

vi.mock("./pages/TablePage/index", () => ({
  default: ({ userId }: { userId: string }) => (
    <>
      <HandleForm userId={userId} page="table" submitLabel="Show Progress" />
      <div>Table: {userId}</div>
    </>
  ),
}));
vi.mock("./pages/UserPage/index", () => ({
  default: ({ userId }: { userId: string }) => (
    <>
      <HandleForm userId={userId} page="user" submitLabel="Show Stats" />
      <div>User: {userId}</div>
    </>
  ),
}));

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: () => ({ matches: false, addListener() {}, removeListener() {} }),
  });
});
afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
});
const mountAt = (hash: string) => {
  window.history.replaceState(null, "", `/${hash}`);
  return render(<App />);
};
const input = () => screen.getByPlaceholderText("Codeforces ID");
const link = (name: string) => screen.getByRole("link", { name });
const submit = () => fireEvent.submit(input().closest("form")!);

// Cases were checked against v5 matchPath before migration.
test.each([
  ["#/table/", "Table:"],
  ["#/user/", "User:"],
  ["#/table/tourist", "Table: tourist"],
  ["#/user/tourist", "User: tourist"],
  ["#/table/a_B.c-9", "Table: a_B.c-9"],
  ["#/user/a_B.c-9", "User: a_B.c-9"],
  ["#/TABLE/tourist", "Table: tourist"],
  ["#/table/tourist/extra", "Table: tourist"],
  ["#/user/tourist?tab=history", "User: tourist"],
])("preserves the %s bookmark", async (hash, text) => {
  mountAt(hash);
  expect(await screen.findByText(text)).toBeInTheDocument();
  expect(window.location.hash).toBe(hash);
});

test.each([
  "#/",
  "#/unknown",
  "#/table",
  "#/user",
  "#/table/bad!",
  "#/user/bad!",
  "#/table/%61bc",
])("keeps the fallback for %s", async (hash) => {
  mountAt(hash);
  expect(await screen.findByText("Table:")).toBeInTheDocument();
  expect(window.location.hash).toBe("#/table/");
});

test("Submitting pushes history and back/forward keeps the input in sync", async () => {
  mountAt("#/table/alice");
  const field = input();
  field.focus();
  fireEvent.change(input(), { target: { value: " bob " } });
  fireEvent.click(screen.getByRole("button", { name: "Show Progress" }));
  expect(await screen.findByText("Table: bob")).toBeInTheDocument();
  expect(window.location.hash).toBe("#/table/bob");
  expect(input()).toBe(field);
  expect(field).toHaveFocus();
  await act(async () => {
    window.history.back();
  });
  await waitFor(() => {
    expect(screen.getByText("Table: alice")).toBeInTheDocument();
    expect(input()).toHaveValue("alice");
  });
  await act(async () => {
    window.history.forward();
  });
  await waitFor(() => {
    expect(screen.getByText("Table: bob")).toBeInTheDocument();
    expect(input()).toHaveValue("bob");
  });
});

test("navigation keeps the applied handle across information pages and adds history entries", async () => {
  mountAt("#/table/alice");
  fireEvent.change(input(), { target: { value: "unsubmitted" } });
  const info = screen.getByRole("button", { name: "Info" });
  fireEvent.keyDown(info, { key: "Enter" });
  expect(await screen.findByRole("menu")).toBeInTheDocument();
  expect(window.location.hash).toBe("#/table/alice");
  fireEvent.click(screen.getByRole("menuitem", { name: "Changelog" }));
  expect(
    await screen.findByRole("heading", { name: "Changelog" })
  ).toBeInTheDocument();
  expect(info).toHaveAttribute("aria-current", "location");
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  fireEvent.keyDown(info, { key: "Enter" });
  fireEvent.click(await screen.findByRole("menuitem", { name: "About" }));
  expect(
    await screen.findByRole("heading", { name: "About" })
  ).toBeInTheDocument();
  expect(link("User Stats")).toHaveAttribute("href", "#/user/alice");
  fireEvent.click(link("User Stats"));
  expect(await screen.findByText("User: alice")).toBeInTheDocument();
  expect(input()).toHaveValue("alice");
  await act(async () => window.history.back());
  expect(
    await screen.findByRole("heading", { name: "About" })
  ).toBeInTheDocument();
});

test("the logo opens the empty table and user statistics can open without a handle", async () => {
  mountAt("#/user/alice");
  fireEvent.click(link("Codeforces Problems"));
  expect(await screen.findByText("Table:")).toBeInTheDocument();
  expect(window.location.hash).toBe("#/table/");
  fireEvent.click(link("User Stats"));
  expect(await screen.findByText("User:")).toBeInTheDocument();
  expect(window.location.hash).toBe("#/user/");
});

test("guards Enter and submit during IME composition", async () => {
  mountAt("#/table/alice");
  fireEvent.change(input(), { target: { value: "a_B.c-9" } });
  fireEvent.compositionStart(input());
  expect(fireEvent.keyDown(input(), { key: "Enter" })).toBe(false);
  submit();
  expect(window.location.hash).toBe("#/table/alice");
  fireEvent.compositionEnd(input());
  expect(fireEvent.keyDown(input(), { key: "Enter", isComposing: true })).toBe(
    false
  );
  expect(fireEvent.keyDown(input(), { key: "Enter", keyCode: 229 })).toBe(
    false
  );
  expect(fireEvent.keyDown(input(), { key: "Enter" })).toBe(true);
  submit();
  expect(await screen.findByText("Table: a_B.c-9")).toBeInTheDocument();
});

test("loads contest data through an ES module import", () => {
  expect(cachedContestArray()[0]).toEqual(
    expect.objectContaining({
      id: expect.any(Number),
      name: expect.any(String),
      problems: expect.any(Array),
    })
  );
});
