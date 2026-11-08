import React from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import UserPage from "./index";
import { cachedUserInfo } from "../../utils/TypedCachedApiClient";
import { fetchUserSubmission, makeAchievementData } from "./userUtils";

vi.mock("../../utils/TypedCachedApiClient", () => ({
  cachedUserInfo: vi.fn(),
}));
vi.mock("./userUtils", () => ({
  fetchUserSubmission: vi.fn(),
  makeAchievementData: vi.fn(),
}));
vi.mock("../../components/Header/Header", () => ({ default: () => null }));
vi.mock("./Climbing", () => ({ default: () => null }));
vi.mock("./Heatmap", () => ({ default: () => null }));
vi.mock("./Achievement", () => ({ default: () => null }));
vi.mock("./UserNameLabel", () => ({ default: () => null }));

beforeAll(() =>
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: () => ({ matches: false, addListener() {}, removeListener() {} }),
  })
);
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(fetchUserSubmission).mockResolvedValue([]);
  vi.mocked(makeAchievementData).mockReturnValue({
    submission: [],
    solvedCountAll: 0,
    solvedCountLastYear: 0,
    solvedCountLastMonth: 0,
    longestStreak: 0,
    currentStreak: 0,
    streakSum: 0,
  });
});
afterEach(cleanup);

test.each([
  [false, "User not found!"],
  [
    true,
    "Failure to fetch submissions data. Codeforces is down now or you may mistyped.",
  ],
])(
  "replaces the pending status with the existing error message (fetchFailure=%s)",
  async (isError, message) => {
    let resolveInfo!: (value: object) => void;
    vi.mocked(cachedUserInfo).mockReturnValue(
      new Promise((resolve) => {
        resolveInfo = resolve;
      })
    );
    render(<UserPage userId="alice" />);
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    await act(async () =>
      resolveInfo({ isError, isUserExist: false, userRating: 0 })
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(message);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(fetchUserSubmission).not.toHaveBeenCalled();
  }
);

test("shows the native empty submission table after a successful empty response", async () => {
  vi.mocked(cachedUserInfo).mockResolvedValue({
    isUserExist: true,
    isError: false,
    userRating: 0,
  });
  render(<UserPage userId="alice" />);
  expect(await screen.findByText("No data")).toBeInTheDocument();
  expect(
    screen.getByRole("table", { name: "Submissions" })
  ).toBeInTheDocument();
  expect(screen.getAllByRole("columnheader")).toHaveLength(5);
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Next Page" })
  ).not.toBeInTheDocument();
});
