import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
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
        <Header userId="alice" location="table" />
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

test("opens and closes the mobile menu, synchronizing its theme and username controls", () => {
  mount();
  const menuButton = screen.getByRole("button", { name: "Toggle navigation" });
  expect(menuButton).toHaveAttribute("aria-expanded", "false");
  expect(document.getElementById("mobile-menu")).toBeNull();
  fireEvent.click(menuButton);
  expect(menuButton).toHaveAttribute("aria-expanded", "true");
  const menu = within(document.getElementById("mobile-menu")!);
  fireEvent.click(menu.getByRole("switch", { name: "Dark theme" }));
  for (const toggle of screen.getAllByRole("switch", { name: "Dark theme" })) {
    expect(toggle).toBeChecked();
  }
  fireEvent.change(menu.getByPlaceholderText("Codeforces ID"), {
    target: { value: "a_B.c-9" },
  });
  for (const input of screen.getAllByPlaceholderText("Codeforces ID")) {
    expect(input).toHaveValue("a_B.c-9");
  }
  fireEvent.keyDown(menu.getByPlaceholderText("Codeforces ID"), {
    key: "Enter",
    code: "Enter",
    keyCode: 13,
  });
  expect(window.location.hash).toBe("#/table/a_B.c-9");
  fireEvent.click(menuButton);
  expect(document.getElementById("mobile-menu")).toBeNull();
  fireEvent.click(menuButton);
  expect(
    within(document.getElementById("mobile-menu")!).getByRole("switch", {
      name: "Dark theme",
    })
  ).toBeChecked();
});
