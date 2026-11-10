import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { HashRouter } from "react-router";
import Header from "./Header";
import ThemeProvider from "../ThemeProvider";

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: () => ({ matches: false, addListener() {}, removeListener() {} }),
  });
});
beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "host-class";
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.className = "";
  window.history.replaceState(null, "", "/");
});
const mount = () =>
  render(
    <ThemeProvider>
      <HashRouter>
        <Header userId="alice" />
      </HashRouter>
    </ThemeProvider>
  );

test("restores the saved theme and preserves unrelated html classes on change and unmount", () => {
  localStorage.setItem("theme", JSON.stringify("dark"));
  const { unmount } = mount();
  expect(screen.getByRole("switch", { name: "Dark theme" })).toBeChecked();
  expect(document.documentElement).toHaveClass("host-class", "theme-dark");
  fireEvent.click(screen.getByRole("switch", { name: "Dark theme" }));
  expect(document.documentElement).toHaveClass("host-class", "theme-light");
  expect(document.documentElement).not.toHaveClass("theme-dark");
  expect(JSON.parse(localStorage.getItem("theme")!)).toBe("light");
  unmount();
  expect(document.documentElement).toHaveClass("host-class");
  expect(document.documentElement).not.toHaveClass("theme-light");
});
