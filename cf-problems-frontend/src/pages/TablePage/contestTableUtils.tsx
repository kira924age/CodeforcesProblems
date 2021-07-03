import React from "react";
import DifficultyCircle from "../../components/DifficultyCircle";

import { getRatingColorClass } from "../../utils/colors";

export const makeColumns = (n: number) => {
  let res = [
    {
      title: "Contest",
      dataIndex: "name",
      render: (text: string) => text,
    },
  ];
  for (let i = 0; i < n; i++) {
    const alp: string = String.fromCharCode(65 + i);
    res.push({
      title: alp,
      dataIndex: alp,
      render: (text: string) => text,
    });
  }
  return res;
};

export const makeContestColumns = (contest: string) => {
  let columnNum: number = 9;

  switch (contest) {
    case "Educational Codeforces Rounds":
      columnNum = 9;
      break;
    case "Codeforces Global Rounds":
      columnNum = 9;
      break;
    case "Div. 1 + Div. 2 Contests":
      columnNum = 8;
      break;
    case "Div. 1 Contests":
      columnNum = 7;
      break;
    case "Div. 2 Contests":
      columnNum = 8;
      break;
    case "Div. 3 Contests":
      columnNum = 8;
      break;
    case "Div. 4 Contests":
      columnNum = 7;
      break;
    case "ICPC":
      columnNum = 14;
      break;
    case "Kotlin Heroes":
      columnNum = 10;
      break;
    case "Q#":
      columnNum = 9;
      break;
    case "Other Contests":
      columnNum = 10;
      break;
    case "All Contests":
      columnNum = 14;
      break;
  }

  let columns = makeColumns(columnNum);

  if (contest === "Microsoft Q# Coding Contests") {
    columns = [
      ...makeColumns(9),
      {
        title: "U",
        dataIndex: "U",
        render: (text: string) => text,
      },
    ];
  }
  return columns;
};

const PREFIX = "https://codeforces.com/contest/";

export const makeContestTable = (
  problemData: object[],
  isShowDifficulty: boolean,
  acList: Map<string, boolean>
) => {
  return problemData.map((x: any) => {
    let obj: any = {};
    let contestId = x.id;
    let contestName = x.name;
    let problems = x.problems;

    let isOk: boolean = problems !== null ? true : false;

    let mp: Map<string, number> = new Map();

    if (problems !== null) {
      problems.forEach((e: any) => {
        const t = acList!.get(String(x.id) + String(e.index));
        isOk = isOk && (t === undefined ? false : true);

        let cnt = mp.get(e.index[0]);
        if (cnt === undefined) {
          cnt = 1;
        } else {
          cnt++;
        }
        mp.set(e.index[0], cnt);
      });
    }

    const contestClassName = isOk ? "cell-element OK" : "cell-element";

    obj["name"] = (
      <div className={contestClassName}>
        <a
          href={PREFIX + String(contestId)}
          rel="noopener noreferrer"
          target="_blank"
        >
          {contestName}
        </a>
      </div>
    );

    if (problems === null) {
      return obj;
    }

    problems.forEach((e: any) => {
      const ratingColorClass = isShowDifficulty
        ? getRatingColorClass(e.rating)
        : "difficulty-black";
      const problemId: string = e.index;
      const problemName: string = e.name;

      let isOk: boolean = true;
      const tmp = acList!.get(contestId + problemId);
      isOk = isOk && (tmp === undefined ? false : true);

      let classOK = "cell-element OK-" + String(mp.get(e.index[0]));
      let classNA = "cell-element NA-" + String(mp.get(e.index[0]));
      // let classNG = "cell-element NG" + "-" + String(mp.get(e.index[0]));

      const className = isOk ? classOK : classNA;

      obj[problemId[0]] = (
        <>
          {obj[problemId[0]] !== undefined ? (
            <>
              {obj[problemId[0]]}
              <div className={className}>
                {isShowDifficulty && <DifficultyCircle rating={e.rating} />}
                <a
                  href={PREFIX + String(x.id) + "/problem/" + e.index}
                  rel="noopener noreferrer"
                  target="_blank"
                  className={ratingColorClass}
                >
                  {String(e.index) + ". " + problemName}
                </a>
              </div>
            </>
          ) : (
            <div className={className}>
              {isShowDifficulty && <DifficultyCircle rating={e.rating} />}
              <a
                href={PREFIX + String(x.id) + "/problem/" + e.index}
                rel="noopener noreferrer"
                target="_blank"
                className={ratingColorClass}
              >
                {String(e.index) + ". " + problemName}
              </a>
            </div>
          )}
        </>
      );
    });
    return obj;
  });
};

let filterProblemsMap : Map<string, object[]> = new Map();

export const filterProblems = (
  contestName: string,
  allProblems: object[]
): object[] => {
  let problemData;

  let a = filterProblemsMap.get(contestName);
  if (a !== undefined) {
    return a;
  }

  if (contestName === "All Contests") {
    problemData = allProblems;
    filterProblemsMap.set("All Contests", problemData)
  } else if (contestName === "Educational Codeforces Rounds") {
    problemData = allProblems.filter((obj: any) => {
      return obj.type === "Educational";
    });
    filterProblemsMap.set("Educational Codeforces Rounds", problemData)
  } else if (contestName === "Codeforces Global Rounds") {
    problemData = allProblems.filter((obj: any) => {
      return obj.type === "Global";
    });
    filterProblemsMap.set("Codeforces Global Rounds", problemData)
  } else if (contestName === "Div. 1 + Div. 2 Contests") {
    problemData = allProblems.filter((obj: any) => {
      return obj.type === "Div1 + Div2";
    });
    filterProblemsMap.set("Div. 1 + Div. 2 Contests", problemData)
  } else if (contestName === "Div. 1 Contests") {
    problemData = allProblems.filter((obj: any) => {
      return obj.type === "Div1";
    });
    filterProblemsMap.set("Div. 1 Contests", problemData)
  } else if (contestName === "Div. 2 Contests") {
    problemData = allProblems.filter((obj: any) => {
      return obj.type === "Div2";
    });
    filterProblemsMap.set("Div. 2 Contests", problemData)
  } else if (contestName === "Div. 3 Contests") {
    problemData = allProblems.filter((obj: any) => {
      return obj.type === "Div3";
    });
    filterProblemsMap.set("Div. 3 Contests", problemData)
  } else if (contestName === "Div. 4 Contests") {
    problemData = allProblems.filter((obj: any) => {
      return obj.type === "Div4";
    });
    filterProblemsMap.set("Div. 4 Contests", problemData)
  } else if (contestName === "Kotlin Heroes") {
    problemData = allProblems.filter((obj: any) => {
      return obj.type === "Kotlin";
    });
    filterProblemsMap.set("Kotlin Heroes", problemData)
  } else if (contestName === "ICPC") {
    problemData = allProblems.filter((obj: any) => {
      return obj.type === "ICPC";
    });
    filterProblemsMap.set("ICPC", problemData)
  } else if (contestName === "Microsoft Q# Coding Contests") {
    problemData = allProblems.filter((obj: any) => {
      return obj.type === "Q#";
    });
    filterProblemsMap.set("Microsoft Q# Coding Contests", problemData)
  } else if (contestName === "Other Contests") {
    problemData = allProblems.filter((obj: any) => {
      return obj.type === "Other";
    });
    filterProblemsMap.set("Other Contests", problemData)
  }

  if (problemData !== undefined) {
    return problemData;
  } else {
    return [];
  }
};
