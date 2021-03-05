import { getRatingColor } from "../../utils/colors";

function formatDate(dateSecond: number): string {
  const date = new Date(dateSecond * 1000);
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export const makeSolvedHistory = (submission: any[]) => {
  let count = 0;
  let cntRed = 0;
  let cntOrange = 0;
  let cntViolet = 0;
  let cntBlue = 0;
  let cntCyan = 0;
  let cntGreen = 0;
  let cntGrey = 0;
  let cntOther = 0;

  let solvedHistory: any[] = [];

  let isSolved = new Map();
  const revSubmission: any[] = submission.slice().reverse();

  let newRevSubmission = [] as any[];
  revSubmission.forEach((x) => {
    if (x.verdict !== "OK") {
      return;
    }

    const p = x.problem;
    const problemId = String(p.contestId) + ":" + String(p.index);

    if (isSolved.get(problemId)) {
      return;
    }

    isSolved.set(problemId, true);
    newRevSubmission.push(x);
  });

  const numSubmission: number = newRevSubmission.length;

  for (let i = 0; i < numSubmission; i++) {
    const x = newRevSubmission[i];

    count++;

    const color = getRatingColor(x.problem.rating);

    switch (color) {
      case "Red":
        cntRed++;
        break;
      case "Orange":
        cntOrange++;
        break;
      case "Violet":
        cntViolet++;
        break;
      case "Blue":
        cntBlue++;
        break;
      case "Cyan":
        cntCyan++;
        break;
      case "Green":
        cntGreen++;
        break;
      case "Grey":
        cntGrey++;
        break;
      case "Black":
        cntOther++;
        break;
    }

    const dateSecond = x.creationTimeSeconds;
    if (
      i !== numSubmission - 1 &&
      numSubmission > 1 &&
      formatDate(dateSecond) ===
        formatDate(newRevSubmission[i + 1].creationTimeSeconds)
    ) {
      continue;
    }

    solvedHistory.push({
      dateSecond: dateSecond,
      dateFormat: formatDate(dateSecond),
      count: count,
      Red: cntRed,
      Orange: cntOrange,
      Violet: cntViolet,
      Blue: cntBlue,
      Cyan: cntCyan,
      Green: cntGreen,
      Grey: cntGrey,
      Other: cntOther,
    });
  }

  return solvedHistory;
};
