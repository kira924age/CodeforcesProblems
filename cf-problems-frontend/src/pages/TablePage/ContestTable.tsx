import React from "react";
import { Table } from "antd";

import {
  makeContestColumns,
  makeContestTable,
  filterProblems,
} from "./contestTableUtils";

import {
  cachedUserSubmissions,
  cachedContestArray,
} from "../../utils/TypedCachedApiClient";

import ErrorMessage from "./ErrorMessage";

interface ContestTableProps {
  name: string;
  isShowDifficulty: boolean;
  isReverseOrder: boolean;
  userId: string | undefined;
}

const ContestTable: React.FC<ContestTableProps> = (props) => {
  const [isFetchFailure, setIsFetchFailure] = React.useState(false);
  const [submissions, setSubmissions] = React.useState(new Map());

  React.useEffect(() => {
    let isMounted = true;
    if (props.userId === undefined || props.userId === "") {
      if (isMounted) {
        setSubmissions(new Map());
      }
      return;
    }

    const getUserSubmissions = async () => {
      const [userSubmission] = await Promise.all([
        cachedUserSubmissions(String(props.userId)),
      ]);

      if (isMounted) {
        if (userSubmission === null) {
          setIsFetchFailure(true);
          setSubmissions(new Map());
        } else {
          setIsFetchFailure(false);
          setSubmissions(userSubmission);
        }
      }
    };

    void getUserSubmissions();

    return () => {
      isMounted = false;
    };
  }, [props.userId]);

  const allProblems = cachedContestArray();
  let problemData = filterProblems(props.name, allProblems);

  if (props.isReverseOrder) {
    problemData = [...problemData].reverse();
  }

  let contestTable = makeContestTable(
    problemData,
    props.isShowDifficulty,
    submissions
  );

  const columns = makeContestColumns(props.name);

  return (
    <React.Fragment>
      <h2>{props.name}</h2>
      {isFetchFailure && <ErrorMessage />}
      <Table
        pagination={{
          defaultPageSize: 50,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        bordered
        className="ant-contest-table"
        columns={columns}
        dataSource={contestTable}
      />
    </React.Fragment>
  );
};

export default ContestTable;
