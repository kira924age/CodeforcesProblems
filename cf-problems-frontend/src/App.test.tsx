import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import App from "./App";
import HandleForm, { type HandleProps } from "./components/HandleForm";

vi.mock("./pages/TablePage/index", () => ({
  default: (props: HandleProps) => (
    <>
      <HandleForm {...props} submitLabel="Show Progress" />
      <div>Table: {props.userId}</div>
    </>
  ),
}));
vi.mock("./pages/UserPage/index", () => ({
  default: (props: HandleProps) => (
    <>
      <HandleForm {...props} submitLabel="Show Stats" />
      <div>User: {props.userId}</div>
    </>
  ),
}));

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
});
const mountAt = (url: string) => {
  window.history.replaceState(null, "", url);
  return render(<App />);
};
const input = () => screen.getByPlaceholderText("Codeforces ID");
const link = (name: string) => screen.getByRole("link", { name });
const submit = () => fireEvent.submit(input().closest("form")!);

test.each(["/", "/user"])("opens %s without a saved handle", (url) => {
  mountAt(url);
  expect(input()).toHaveValue("");
  expect(window.location.pathname).toBe(url);
  expect(window.location.hash).toBe("");
});

test.each(["/unknown", "/table", "/user/alice"])(
  "shows a missing page at %s without redirecting or clearing the saved handle",
  (url) => {
    localStorage.setItem("userId", JSON.stringify("alice"));
    mountAt(url);
    expect(
      screen.getByRole("heading", { name: "Page not found" })
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe(url);
    expect(localStorage.getItem("userId")).toBe('"alice"');
    fireEvent.click(link("Go to Contests"));
    expect(screen.getByText("Table: alice")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/");
  }
);

test("saves only the applied handle and restores it after a reload", async () => {
  const first = mountAt("/");
  const field = input();
  field.focus();
  fireEvent.change(field, { target: { value: " bob " } });
  expect(JSON.parse(localStorage.getItem("userId")!)).toBe("");
  fireEvent.click(screen.getByRole("button", { name: "Show Progress" }));
  expect(await screen.findByText("Table: bob")).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem("userId")!)).toBe("bob");
  expect(window.location.pathname).toBe("/");
  expect(window.location.hash).toBe("");
  expect(input()).toBe(field);
  expect(field).toHaveFocus();
  first.unmount();
  mountAt("/user");
  expect(screen.getByText("User: bob")).toBeInTheDocument();
  expect(input()).toHaveValue("bob");
});

test("navigation and back/forward keep the latest saved handle across information pages", async () => {
  localStorage.setItem("userId", JSON.stringify("alice"));
  mountAt("/");
  fireEvent.change(input(), { target: { value: "unsubmitted" } });
  const info = screen.getByRole("button", { name: "Info" });
  fireEvent.keyDown(info, { key: "Enter" });
  expect(await screen.findByRole("menu")).toBeInTheDocument();
  expect(window.location.pathname).toBe("/");
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
  expect(link("User Stats")).toHaveAttribute("href", "/user");
  fireEvent.click(link("User Stats"));
  expect(await screen.findByText("User: alice")).toBeInTheDocument();
  expect(input()).toHaveValue("alice");
  fireEvent.change(input(), { target: { value: "bob" } });
  submit();
  await act(async () => window.history.back());
  expect(
    await screen.findByRole("heading", { name: "About" })
  ).toBeInTheDocument();
  await act(async () => window.history.forward());
  await waitFor(() => {
    expect(screen.getByText("User: bob")).toBeInTheDocument();
    expect(input()).toHaveValue("bob");
  });
  fireEvent.click(link("Codeforces Problems"));
  expect(await screen.findByText("Table: bob")).toBeInTheDocument();
});

test.each(["broken JSON", "42", '{"handle":"alice"}', '"bad!"'])(
  "ignores an invalid stored handle: %s",
  (saved) => {
    localStorage.setItem("userId", saved);
    mountAt("/");
    expect(input()).toHaveValue("");
  }
);

test("guards invalid handles and IME submission before saving", async () => {
  localStorage.setItem("userId", JSON.stringify("alice"));
  mountAt("/");
  fireEvent.change(input(), { target: { value: "bad!" } });
  submit();
  expect(localStorage.getItem("userId")).toBe('"alice"');
  fireEvent.change(input(), { target: { value: "a_B.c-9" } });
  fireEvent.compositionStart(input());
  expect(fireEvent.keyDown(input(), { key: "Enter" })).toBe(false);
  submit();
  expect(screen.getByText("Table: alice")).toBeInTheDocument();
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
  expect(JSON.parse(localStorage.getItem("userId")!)).toBe("a_B.c-9");
});
