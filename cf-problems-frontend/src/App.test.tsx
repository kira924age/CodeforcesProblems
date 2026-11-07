import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import App from "./App";
import { cachedContestArray } from "./utils/TypedCachedApiClient";

vi.mock("./pages/TablePage/index", () => ({
  default: ({ userId }: { userId: string }) => <div>Table: {userId}</div>,
}));
vi.mock("./pages/UserPage/index", () => ({
  default: ({ userId }: { userId: string }) => <div>User: {userId}</div>,
}));

afterEach(() => {
  cleanup();
  window.location.hash = "";
});

test("redirects the root hash to the contest table", async () => {
  window.location.hash = "#/";
  render(<App />);
  expect(await screen.findByText("Table:")).toBeInTheDocument();
  expect(window.location.hash).toBe("#/table/");
});

test.each([
  ["#/table/tourist", "Table: tourist"],
  ["#/user/tourist", "User: tourist"],
])("preserves the %s bookmark", async (hash, text) => {
  window.location.hash = hash;
  render(<App />);
  expect(await screen.findByText(text)).toBeInTheDocument();
});

test("loads contest data through an ES module import", () => {
  const contests = cachedContestArray();
  expect(contests.length).toBeGreaterThan(0);
  expect(contests[0]).toEqual(expect.objectContaining({
    id: expect.any(Number),
    name: expect.any(String),
    problems: expect.any(Array),
  }));
});
