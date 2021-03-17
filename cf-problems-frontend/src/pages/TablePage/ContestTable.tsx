import React from "react";
import { Table } from "antd";

import {
  makeContestColumns,
  filterContest,
  makeContestTable,
} from "./contestTableUtils";

import {
  cachedContestArray,
  cachedProblemMap,
  noCachedUserSubmissions,
} from "../../utils/TypedCachedApiClient";

import ErrorMessage from "./ErrorMessage";

interface ContestTableProps {
  name: string;
  isShowDifficulty: boolean;
  userId: string | undefined;
}

const ContestTable: React.FC<ContestTableProps> = (props) => {
  const [isFetchFailue, setIsFetchFailue] = React.useState(false);

  const [acList, setAcList] = React.useState(new Map());

  const problemDataFromLocal = localStorage.getItem("problemData");
  const contestDataFromLocal = localStorage.getItem("contestData");

  const [contestData, setContestData] = React.useState(
    contestDataFromLocal === undefined || contestDataFromLocal === null
      ? ([] as any[])
      : JSON.parse(contestDataFromLocal)
  );

  const [problemData, setProblemData] = React.useState(
    problemDataFromLocal === undefined || problemDataFromLocal === null
      ? new Map()
      : new Map(JSON.parse(problemDataFromLocal))
  );

  const f =
    problemDataFromLocal !== undefined &&
    problemDataFromLocal !== null &&
    contestDataFromLocal !== undefined &&
    contestDataFromLocal !== null;

  const [isLoading, setIsLoading] = React.useState(!f);

  React.useEffect(() => {
    let isMounted = true;
    if (props.userId === undefined || props.userId === "") {
      if (isMounted) {
        setAcList(new Map());
      }
      return;
    }

    const str = "https://codeforces.com/api/user.status?handle=";

    const getUserSubmissions = async () => {
      const [userSubmission] = await Promise.all([
        noCachedUserSubmissions(str + props.userId),
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

  React.useEffect(() => {
    let isMounted = true;

    const getUniversalInfo = async () => {
      const [contests, mp] = await Promise.all([
        cachedContestArray(),
        cachedProblemMap(),
      ]);

      if (contests.length === 0 && mp.size === 0) {
        setIsFetchFailue(true);
      }

      if (isMounted) {
        setContestData(contests);
        setProblemData(mp);
        localStorage.setItem(
          "problemData",
          JSON.stringify(Array.from(mp.entries()))
        );
        localStorage.setItem("contestData", JSON.stringify(contests));
        setIsLoading(false);
      }
    };

    void getUniversalInfo();

    return () => {
      isMounted = false;
    };
  }, []);

  let problemData2;
  if (problemData.size !== 0 && problemData.size !== undefined) {
    let filteredContestData: object[] = contestData!.filter((obj: any) => {
      const id = obj.id;
      return problemData.has(id);
    });

    filteredContestData = filterContest(props.name, filteredContestData);

    problemData2 = makeContestTable(
      filteredContestData,
      problemData,
      props.isShowDifficulty,
      acList
    );
  }

  const columns = makeContestColumns(props.name);

  return (
    <React.Fragment>
      <h2>{props.name}</h2>

      {isFetchFailue && <ErrorMessage />}

      {isLoading ? (
        <Table
          loading
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
                Now Loading!!!!
              </React.Fragment>
            ),
          }}
        />
      ) : (
        <Table
          pagination={{
            defaultPageSize: 50,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          bordered
          className="ant-contest-table"
          columns={columns}
          dataSource={problemData2}
        />
      )}
    </React.Fragment>
  );
};

export default ContestTable;
