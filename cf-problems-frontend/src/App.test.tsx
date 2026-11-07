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
import Header from "./components/Header/Header";
import { cachedContestArray } from "./utils/TypedCachedApiClient";

vi.mock("./pages/TablePage/index", () => ({
  default: ({ userId }: { userId: string }) => (
    <>
      <Header userId={userId} location="table" />
      <div>Table: {userId}</div>
    </>
  ),
}));
vi.mock("./pages/UserPage/index", () => ({
  default: ({ userId }: { userId: string }) => (
    <>
      <Header userId={userId} location="user" />
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
const input = () => screen.getAllByPlaceholderText("Codeforces ID")[0];
const link = (name: string) => screen.getAllByRole("link", { name })[0];

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

test("Enter pushes history and back/forward keeps the input in sync", async () => {
  mountAt("#/table/alice");
  fireEvent.change(input(), { target: { value: "bob" } });
  fireEvent.keyDown(input(), { key: "Enter", code: "Enter", keyCode: 13 });
  expect(await screen.findByText("Table: bob")).toBeInTheDocument();
  expect(window.location.hash).toBe("#/table/bob");
  await act(async () => {
    window.history.back();
  });
  await waitFor(() =>
    expect(screen.getByText("Table: alice")).toBeInTheDocument()
  );
  expect(input()).toHaveValue("alice");
  await act(async () => {
    window.history.forward();
  });
  await waitFor(() =>
    expect(screen.getByText("Table: bob")).toBeInTheDocument()
  );
  expect(input()).toHaveValue("bob");
});

test("Table/User links replace history; Enter still pushes on User", async () => {
  mountAt("#/table/alice");
  fireEvent.change(input(), { target: { value: "bob" } });
  fireEvent.keyDown(input(), { key: "Enter", code: "Enter", keyCode: 13 });
  await screen.findByText("Table: bob");
  fireEvent.click(link("User"));
  expect(await screen.findByText("User: bob")).toBeInTheDocument();
  expect(window.location.hash).toBe("#/user/bob");
  fireEvent.change(input(), { target: { value: "carol" } });
  fireEvent.keyDown(input(), { key: "Enter", code: "Enter", keyCode: 13 });
  expect(await screen.findByText("User: carol")).toBeInTheDocument();
  fireEvent.click(link("Table"));
  expect(await screen.findByText("Table: carol")).toBeInTheDocument();
  await act(async () => {
    window.history.back();
  });
  await waitFor(() =>
    expect(screen.getByText("User: bob")).toBeInTheDocument()
  );
  await act(async () => {
    window.history.back();
  });
  await waitFor(() =>
    expect(screen.getByText("Table: alice")).toBeInTheDocument()
  );
});

test("the logo opens the empty table and User is disabled without a handle", async () => {
  mountAt("#/user/alice");
  fireEvent.click(link("Codeforces Problems"));
  expect(await screen.findByText("Table:")).toBeInTheDocument();
  expect(window.location.hash).toBe("#/table/");
  expect(screen.getAllByRole("button", { name: "User" })[0]).toBeDisabled();
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
