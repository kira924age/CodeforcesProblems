const STATIC_API_BASE_URL = "https://codeforces.com/api";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetchContests = async (url: string): Promise<any> => {
  let tmp: any = [];
  await fetch(url)
    .then((res) => res.json())
    .then((x) => {
      tmp = x.result.filter((obj: any) => {
        return obj.phase === "FINISHED";
      });
    });

  return tmp;
};

let CACHED_CONTESTS: any[];
export const cachedContestArray = async (): Promise<any[]> => {
  if (CACHED_CONTESTS === undefined) {
    try {
      let t = await fetchContests(STATIC_API_BASE_URL + "/contest.list");
      CACHED_CONTESTS = t;
    } catch (e) {
      // console.log(e);
      CACHED_CONTESTS = [];
    }
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
        STATIC_API_BASE_URL + "/problemset.problems"
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
  await fetch(url)
    .then((res) => res.json())
    .then((x) => {
      tmp = x.result.filter((x: any) => x.verdict === "OK");
    })
    .catch((error) => {
      console.log("Error: ", error.message);
      return;
    });

  let newMap: Map<string, boolean> = new Map();
  tmp.forEach((x: any) => {
    let t = String(x.problem.contestId) + x.problem.index;
    newMap.set(t, true);
  });

  return newMap;
};

export const noCachedUserSubmissions = async (url: string): Promise<any> => {
  let res;
  try {
    res = await fetchUserSubmissions(url);
  } catch (e) {
    console.log(e);
    res = new Map();
  }
  return res;
};

const fetchUserInfo = async (url: string): Promise<any> => {
  let currentRating: number = 0;
  let isUserExist: boolean = true;
  await fetch(url)
    .then((res) => res.json())
    .catch(() => {
      isUserExist = false;
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
          STATIC_API_BASE_URL + "/user.info?handles=" + userId
        )
      );
    } catch (e) {
      // console.log(e);
      CACHED_PROBLEMS = new Map();
    }
  }
  return CACHED_USER_INFO.get(userId);
};
