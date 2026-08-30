const STATIC_API_BASE_URL = "https://codeforces.com/api";

let CACHED_CONTESTS: any[];
export const cachedContestArray = () => {
  if (CACHED_CONTESTS === undefined) {
    CACHED_CONTESTS = require("./contests.json");
  }
  return CACHED_CONTESTS;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetchProblems = async (url: string): Promise<any> => {
  let tmp = new Map();
  await fetch(url)
    .then((res) => res.json())
    .then((x) => {
      let array = x.result.problems;
      let mp = new Map();
      array.reverse().forEach((element: any) => {
        const contestId = element.contestId;
        if (mp.has(contestId)) {
          const prevArray = mp.get(contestId);
          mp.set(contestId, [...prevArray, element]);
        } else {
          mp.set(contestId, [element]);
        }
      });
      tmp = mp;
    });
  return tmp;
};

let CACHED_PROBLEMS: any;
export const cachedProblemMap = async (): Promise<any> => {
  if (CACHED_PROBLEMS === undefined) {
    try {
      CACHED_PROBLEMS = await fetchProblems(
        STATIC_API_BASE_URL + "/problemset.problems",
      );
    } catch (e) {
      // console.log(e);
      CACHED_PROBLEMS = new Map();
    }
  }
  return CACHED_PROBLEMS;
};

const fetchUserSubmissions = async (url: string): Promise<any> => {
  let tmp: any = [];
  let isOk = true;
  await fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((x) => {
      tmp = x.result;
    })
    .catch((error) => {
      console.error("Error: ", error.message);
      isOk = false;
    });

  if (!isOk) {
    return null;
  }
  let newMap: Map<string, boolean> = new Map();

  tmp.forEach((x: any) => {
    let t = String(x.problem.contestId) + x.problem.index;

    if (newMap.has(t)) {
      const prev = newMap.get(t);
      newMap.set(t, prev || x.verdict === "OK");
    } else {
      newMap.set(t, x.verdict === "OK");
    }
  });

  return newMap;
};

let CACHED_USER_SUBMISSIONS: Map<string, any> = new Map();
export const cachedUserSubmissions = async (userId: string): Promise<any> => {
  const prefixStr = "https://codeforces.com/api/user.status?handle=";
  const url = prefixStr + userId;

  if (CACHED_USER_SUBMISSIONS.get(userId) === undefined) {
    try {
      CACHED_USER_SUBMISSIONS.set(userId, await fetchUserSubmissions(url));
    } catch (e) {
      console.log(e);
    }
  }
  return CACHED_USER_SUBMISSIONS.get(userId);
};

const fetchUserInfo = async (url: string): Promise<any> => {
  let currentRating: number = 0;
  let isUserExist: boolean = true;
  let isError: boolean = false;

  await fetch(url)
    .then((res) => res.json())
    .catch(() => {
      isError = true;
    })
    .then((x) => {
      if (x.status !== "OK") {
        isUserExist = false;
      }
      currentRating = x.result[0].rating;
    })
    .catch((error) => {
      console.log("Error: ", error.message);
      return;
    });

  return {
    isUserExist: isUserExist,
    isError: isError,
    userRating: currentRating,
  };
};

let CACHED_USER_INFO: Map<string, any> = new Map();
export const cachedUserInfo = async (userId: string): Promise<any> => {
  if (CACHED_USER_INFO.get(userId) === undefined) {
    try {
      CACHED_USER_INFO.set(
        userId,
        await fetchUserInfo(
          STATIC_API_BASE_URL + "/user.info?handles=" + userId,
        ),
      );
    } catch (e) {
      // console.log(e);
      CACHED_PROBLEMS = new Map();
    }
  }
  return CACHED_USER_INFO.get(userId);
};
