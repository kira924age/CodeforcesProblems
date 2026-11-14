import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import UserPage from "./index";
import { TooltipProvider } from "../../components/ui/Tooltip";
import {
  cachedSubmissionHistory,
  cachedUserInfo,
} from "../../utils/TypedCachedApiClient";
import { makeAchievementData } from "./userUtils";

vi.mock("../../utils/TypedCachedApiClient", () => ({
  cachedSubmissionHistory: vi.fn(),
  cachedUserInfo: vi.fn(),
}));
vi.mock("./userUtils", () => ({
  makeAchievementData: vi.fn(),
}));
vi.mock("./Climbing", () => ({ default: () => null }));
vi.mock("./Heatmap", () => ({ default: () => null }));
vi.mock("./Achievement", () => ({ default: () => null }));
vi.mock("./UserNameLabel", () => ({ default: () => null }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(cachedUserInfo).mockResolvedValue({ userRating: 0 });
  vi.mocked(cachedSubmissionHistory).mockResolvedValue([]);
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
const mount = (userId = "alice") =>
  render(
    <TooltipProvider>
      <UserPage userId={userId} onUserIdChange={vi.fn()} />
    </TooltipProvider>
  );

test.each([
  [false, "User not found!"],
  [
    true,
    "Failure to fetch submissions data. Codeforces is down now or you may mistyped.",
  ],
])(
  "replaces the pending status with the existing error message (fetchFailure=%s)",
  async (isError, message) => {
    if (isError) {
      vi.mocked(cachedUserInfo).mockRejectedValue(new Error("offline"));
    } else {
      vi.mocked(cachedUserInfo).mockResolvedValue(null);
    }
    mount();
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    expect(await screen.findByRole("alert")).toHaveTextContent(message);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(cachedSubmissionHistory).not.toHaveBeenCalled();
  }
);

test("shows the native empty submission table after a successful empty response", async () => {
  mount();
  expect(await screen.findByText("No data")).toBeInTheDocument();
  expect(
    screen.getByRole("table", { name: "Submissions" })
  ).toBeInTheDocument();
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

test("opens statistics without fetching until a handle is provided", () => {
  mount("");
  expect(screen.getByRole("button", { name: "Refresh" })).toBeDisabled();
  expect(cachedUserInfo).not.toHaveBeenCalled();
});

test("starts refreshing submissions before the profile resolves", async () => {
  const { unmount } = mount();
  await screen.findByText("No data");

  vi.mocked(cachedUserInfo).mockReturnValueOnce(new Promise(() => {}));
  fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
  unmount();

  expect(cachedUserInfo).toHaveBeenLastCalledWith("alice", true);
  expect(cachedSubmissionHistory).toHaveBeenLastCalledWith("alice", true);
});

test("refetches both user info and submissions and recovers from a failure", async () => {
  mount();
  await screen.findByText("No data");
  vi.mocked(cachedSubmissionHistory).mockRejectedValueOnce(
    new Error("offline")
  );
  fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
  await screen.findByRole("alert");
  expect(cachedUserInfo).toHaveBeenLastCalledWith("alice", true);
  expect(cachedSubmissionHistory).toHaveBeenLastCalledWith("alice", true);
  expect(
    screen.getByRole("table", { name: "Submissions" })
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
  await waitFor(() =>
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  );
  expect(await screen.findByRole("button", { name: "Refresh" })).toBeEnabled();
});
