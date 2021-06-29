import React from "react";
import { Table } from "antd";

import {
  makeContestColumns,
  makeContestTable,
} from "./contestTableUtils";

import { cachedUserSubmissions } from "../../utils/TypedCachedApiClient";

import ErrorMessage from "./ErrorMessage";

interface ContestTableProps {
  name: string;
  isShowDifficulty: boolean;
  userId: string | undefined;
}

const ContestTable: React.FC<ContestTableProps> = (props) => {
  const [isFetchFailue, setIsFetchFailue] = React.useState(false);

  const [acList, setAcList] = React.useState(new Map());

  React.useEffect(() => {
    let isMounted = true;
    if (props.userId === undefined || props.userId === "") {
      if (isMounted) {
        setAcList(new Map());
      }
      return;
    }

    const getUserSubmissions = async () => {
      const [userSubmission] = await Promise.all([
        cachedUserSubmissions(String(props.userId)),
      ]);
      if (isMounted) {
        setAcList(userSubmission);
      }
    };

    void getUserSubmissions();

    return () => {
      isMounted = false;
    };
  }, [props.userId]);

  const allProblems = require("./contests.json");

  let problemData = allProblems;
  problemData.forEach( (x: any) => {
    if (x.problems === null) {
      // console.log(x.id, x.name);
    }
  })

  switch (props.name) {
    case "Educational Codeforces Rounds":
      problemData =  problemData.filter((x : any) => (x.type === "Educational"));
      break;
    case "Codeforces Global Rounds":
      problemData =  problemData.filter((x : any) => (x.type === "Global"));
      break;
    case "Div. 1 + Div. 2 Contests":
      problemData =  problemData.filter((x : any) => (x.type === "Div1 + Div2"));
      break;
    case "Div. 1 Contests":
      problemData =  problemData.filter((x : any) => (x.type === "Div1"));
      break;
    case "Div. 2 Contests":
      problemData =  problemData.filter((x : any) => (x.type === "Div2"));
      break;
    case "Div. 3 Contests":
      problemData =  problemData.filter((x : any) => (x.type === "Div3"));
      break;
    case "Div. 4 Contests":
      problemData =  problemData.filter((x : any) => (x.type === "Div4"));
      break;
    case "Microsoft Q# Coding Contests":
      problemData =  problemData.filter((x : any) => (x.type === "Q#"));
      break;
    default:
      problemData = allProblems;
  }

  let problemData2 = makeContestTable(
    props.name,
    problemData,
    props.isShowDifficulty,
    acList
  );
  console.log(problemData2);

  const columns = makeContestColumns(props.name);

  return (
    <React.Fragment>
      <h2>{props.name}</h2>
      <Table
        pagination={{
          defaultPageSize: 50,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        bordered
        className="ant-contest-table"
        columns={columns}
        dataSource={problemData2}
        locale={{
          emptyText: (
            <React.Fragment>
              <br />
            </React.Fragment>
          ),
        }}
      />
    </React.Fragment>
  );
};

export default ContestTable;
