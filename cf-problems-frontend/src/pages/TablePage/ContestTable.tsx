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
  const [mp, setMp] = React.useState(new Map());


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

  let tmp : Map<string, any> = new Map();

  React.useEffect( () => {
    const allProblems = require("./contests.json");
    let problemData = allProblems;

    tmp.set("All Contests", makeContestTable(
      allProblems,
      problemData,
      props.isShowDifficulty,
      acList
    ));

    tmp.set("Educational Codeforces Rounds", makeContestTable(
      allProblems,
      problemData.filter((x : any) => (x.type === "Educational")),
      props.isShowDifficulty,
      acList
    ));

    tmp.set("Codeforces Global Rounds", makeContestTable(
      allProblems,
      problemData.filter((x : any) => (x.type === "Global")),
      props.isShowDifficulty,
      acList
    ));

    tmp.set("Div. 1 + Div. 2 Contests", makeContestTable(
      allProblems,
      problemData.filter((x : any) => (x.type === "Div1 + Div2")),
      props.isShowDifficulty,
      acList
    ));

    tmp.set("Div. 1 Contests", makeContestTable(
      allProblems,
      problemData.filter((x : any) => (x.type === "Div1")),
      props.isShowDifficulty,
      acList
    ));

    tmp.set("Div. 2 Contests", makeContestTable(
      allProblems,
      problemData.filter((x : any) => (x.type === "Div2")),
      props.isShowDifficulty,
      acList
    ));

    tmp.set("Div. 3 Contests", makeContestTable(
      allProblems,
      problemData.filter((x : any) => (x.type === "Div3")),
      props.isShowDifficulty,
      acList
    ));

    tmp.set("Div. 4 Contests", makeContestTable(
      allProblems,
      problemData.filter((x : any) => (x.type === "Div4")),
      props.isShowDifficulty,
      acList
    ));

    tmp.set("Kotlin", makeContestTable(
      allProblems,
      problemData.filter((x : any) => (x.type === "Kotlin")),
      props.isShowDifficulty,
      acList
    ));

    tmp.set("ICPC", makeContestTable(
      allProblems,
      problemData.filter((x : any) => (x.type === "ICPC")),
      props.isShowDifficulty,
      acList
    ));

    tmp.set("Microsoft Q# Coding Contests", makeContestTable(
      allProblems,
      problemData.filter((x : any) => (x.type === "Q#")),
      props.isShowDifficulty,
      acList
    ));

    tmp.set("Other Contests", makeContestTable(
      allProblems,
      problemData.filter((x : any) => (x.type === "Other")),
      props.isShowDifficulty,
      acList
    ));

    setMp(tmp);
  }, [props.isShowDifficulty, acList]);

  const columns = makeContestColumns(props.name);

  return (
    <React.Fragment>
      <h2>{props.name}</h2>
      <Table
        pagination={{
          defaultPageSize: 200,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        bordered
        className="ant-contest-table"
        columns={columns}
        dataSource={mp.get(props.name)}
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
