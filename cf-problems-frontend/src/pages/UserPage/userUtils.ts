import { formatDate } from "../../utils/formatDate";

export const fetchUserSubmission = async (url: string): Promise<any> => {
  let submission: any[] = [];

  await fetch(url)
    .then((res) => res.json())
    .then((x) => {
      submission = x.result?.map((e: any) => {
        let obj = {
          creationTimeSeconds: e.creationTimeSeconds,
          problem: e.problem,
          verdict: e.verdict,
          programmingLanguage: e.programmingLanguage,
          submissionId: e.id,
        };
        return obj;
      });
    })
    .catch((error) => {
      console.log("Error: ", error.message);
      return [];
    });

  return submission;
};

export const makeAchievementData = (submission: any[]) => {
  let isSolved = new Map();
  let isSolvedDay = new Map();
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  let cntSolveLastYear = 0;
  let cntSolveLastMonth = 0;

  let uniqDaySubmissions: number[] = [];
  submission.forEach((x) => {
    if (x.verdict !== "OK") {
      return;
    }
    const time = new Date(x.creationTimeSeconds * 1000);
    const problemId =
      String(x.problem.contestId) + ":" + String(x.problem.index);

    if (isSolved.get(problemId) === undefined) {
      if (time.getMonth() === month - 1) {
        cntSolveLastMonth++;
      }
      if (time.getFullYear() === year - 1) {
        cntSolveLastYear++;
      }
      isSolved.set(problemId, true);

      const formatted = formatDate(time.getTime() / 1000);
      if (isSolvedDay.get(formatted) === undefined) {
        isSolvedDay.set(formatted, true);
        uniqDaySubmissions.push(x.creationTimeSeconds);
      }
    }
  });
  let cntCurrentStreak = 0;
  let tmpTime = today;
  for (let i = 0; i < uniqDaySubmissions.length; i++) {
    const x = uniqDaySubmissions[i];
    const e = formatDate(x);

    if (formatDate(tmpTime.getTime()) === e) {
      cntCurrentStreak++;
    } else {
      break;
    }
    tmpTime = new Date(tmpTime.getTime() - 24 * 3600 * 1000);
  }

  uniqDaySubmissions.reverse();

  let cntLongestStreak = 0;
  let tmp = 0;
  for (let i = 0; i < uniqDaySubmissions.length; i++) {
    if (i === 0) {
      cntLongestStreak = 1;
      tmp = 1;
      continue;
    }
    const lastTime: string = formatDate(uniqDaySubmissions[i] - 24 * 3600);
    const prevTime: string = formatDate(uniqDaySubmissions[i - 1]);

    if (lastTime === prevTime) {
      tmp++;
    } else {
      tmp = 1;
    }
    cntLongestStreak = Math.max(cntLongestStreak, tmp);
  }

  return {
    submission: submission,
    solvedCountAll: isSolved.size,
    solvedCountLastYear: cntSolveLastYear,
    solvedCountLastMonth: cntSolveLastMonth,
    longestStreak: cntLongestStreak,
    currentStreak: cntCurrentStreak,
    streakSum: isSolvedDay.size,
  };
};
