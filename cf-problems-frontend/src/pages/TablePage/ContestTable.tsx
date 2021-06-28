import React from "react";
import { Table } from "antd";

import {
  makeContestColumns,
  filterContest,
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

  const jsonObj = require("./contests.json");
  const problemData = jsonObj;

  console.log(problemData);

  //  let problemData2 = makeContestTable(
  //    props.name,
  //    problemData,
  //    props.isShowDifficulty,
  //    acList
  //  );

  const columns = makeContestColumns(props.name);

  return <></>;
  /*
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
 */
};

export default ContestTable;
