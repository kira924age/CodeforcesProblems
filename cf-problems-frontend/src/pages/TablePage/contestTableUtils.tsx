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
    case "Div. 1 Contests":
      columnNum = 8;
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
    case "Q#":
      columnNum = 9;
      break;
    case "All Contests":
      columnNum = 18;
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
  contestType: string,
  problemData: object[],
  isShowDifficulty: boolean,
  acList: Map<string, boolean>
) => {
  return problemData.map((x: any) => {
    let obj : any = {};
    let contestId = x.id;
    let contestName = x.name;
    let problems = x.problems;

    obj["name"] = (
      <div className="box">
        <div className="cell-element">
          <a
            href={PREFIX + String(contestId)}
            rel="noopener noreferrer"
            target="_blank"
          >
          {contestName}
          </a>
        </div>
      </div>
    );

    if (problems === null) {
      return [];
    }
      problems.forEach((e: any)=> {
        const ratingColorClass = isShowDifficulty
         ? getRatingColorClass(e.rating)
         : "difficulty-black";
        const problemId : string = e.index;
        const problemName : string = e.name;

        obj[problemId[0]] = (
          <>
            {obj[problemId[0]] !== undefined ? (
              <>
                {obj[problemId[0]]}
                  <div className="cell-element">
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
                <div className="cell-element">
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
       )
     });
     return obj;
   });
 };


// export const makeContestTable = (
// ) => {
//   return problemData.map((x: any) => {
// 
//     let obj: any = {};
//     const contestId = x.id;
//     const contestType = x.type;
//     const contestName = x.name;
// 
//     let problems = x.problems;
//
//     let tmp: Map<string, number> = new Map();
//
//     let isOk: boolean = true;
//     problems!.forEach((e: any) => {
//       const t = acList!.get(String(x.id) + String(e.index));
//       isOk = isOk && (t === undefined ? false : true);
// 
//       let cnt = tmp.get(e.index[0]);
//       if (cnt === undefined) {
//         cnt = 1;
//       } else {
//         cnt++;
//       }
//       tmp.set(e.index[0], cnt);
//     });
// 
//     obj["name"] = (
//       <>
//         {isOk ? (
//           <div className="table-success-1 cell-element">
//             <a
//               href={PREFIX + String(x.id)}
//               rel="noopener noreferrer"
//               target="_blank"
//             >
//               {x.name}
//             </a>
//           </div>
//         ) : (
//           <div className="cell-element">
//             <a
//               href={PREFIX + String(x.id)}
//               rel="noopener noreferrer"
//               target="_blank"
//             >
//               {x.name}
//             </a>
//           </div>
//         )}
//       </>
//     );
//
//     problems!.forEach((e: any) => {
//       const className = acList!.get(String(x.id) + String(e.index))
//         ? "table-success-" + tmp.get(e.index[0])
//         : "table-not-success-" + tmp.get(e.index[0]);
//       const ratingColorClass = isShowDifficulty
//         ? getRatingColorClass(e.rating)
//         : "difficulty-black";
//
//       obj[e.index[0]] = (
//         <>
//           {obj[e.index[0]] !== undefined ? (
//             <>
//               {obj[e.index[0]]}
//               <div className={className}>
//                 <div className="cell-element">
//                   {isShowDifficulty && <DifficultyCircle rating={e.rating} />}
//                   <a
//                     href={PREFIX + String(x.id) + "/problem/" + e.index}
//                     rel="noopener noreferrer"
//                     target="_blank"
//                     className={ratingColorClass}
//                   >
//                     {String(e.index) + ". " + e.name}
//                   </a>
//                 </div>
//               </div>
//             </>
//           ) : (
//             <div className={className}>
//               <div className="cell-element">
//                 {isShowDifficulty && <DifficultyCircle rating={e.rating} />}
//                 <a
//                   href={PREFIX + String(x.id) + "/problem/" + e.index}
//                   rel="noopener noreferrer"
//                   target="_blank"
//                   className={ratingColorClass}
//                 >
//                   {String(e.index) + ". " + e.name}
//                 </a>
//               </div>
//             </div>
//           )}
//         </>
//       );
//     });
// 
//     obj["key"] = contestId;
//     obj["id"] = contestId;
// 
//     obj["name"] = <div className="box">{obj["name"]}</div>;
//     obj["A"] = <div className="box">{obj["A"]}</div>;
//     obj["B"] = <div className="box">{obj["B"]}</div>;
//     obj["C"] = <div className="box">{obj["C"]}</div>;
//     obj["D"] = <div className="box">{obj["D"]}</div>;
//     obj["E"] = <div className="box">{obj["E"]}</div>;
//     obj["F"] = <div className="box">{obj["F"]}</div>;
//     obj["G"] = <div className="box">{obj["G"]}</div>;
//     obj["H"] = <div className="box">{obj["H"]}</div>;
//     obj["I"] = <div className="box">{obj["I"]}</div>;
// 
//     return obj;
//   });
// };
