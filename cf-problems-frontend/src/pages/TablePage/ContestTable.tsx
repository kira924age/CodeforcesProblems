import React from "react";
import { Pagination, theme } from "antd";
import EmptyState from "../../components/feedback/EmptyState";
import "./ContestTable.css";

import {
  makeContestColumns,
  makeContestTable,
  filterProblems,
} from "./contestTableUtils";

import { useLocalStorage } from "../../utils/localStorage";

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
  const { token } = theme.useToken();
  const tableStyle = {
    "--contest-link-color": token.colorLink,
    "--contest-link-hover-color": token.colorLinkHover,
    "--contest-link-active-color": token.colorLinkActive,
  } as React.CSSProperties;
  const [page, setPage] = React.useState(1);
  const [isFetchFailure, setIsFetchFailure] = React.useState(false);
  const [submissions, setSubmissions] = React.useState(new Map());
  const [pageSize, setPageSize] = useLocalStorage("pageSize", 50);

  React.useEffect(() => {
    let isMounted = true;
    if (props.userId === undefined || props.userId === "") {
      if (isMounted) {
        setSubmissions(new Map());
      }
      return;
    }

    const getUserSubmissions = async () => {
      const userSubmission = await cachedUserSubmissions(String(props.userId));

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

  const current = Math.min(
    page,
    Math.max(1, Math.ceil(problemData.length / pageSize))
  );
  const start = (current - 1) * pageSize;
  const visibleContests = problemData.slice(start, start + pageSize);
  const contestTable = makeContestTable(
    visibleContests,
    props.isShowDifficulty,
    submissions
  );

  const columns = makeContestColumns(props.name);

  return (
    <React.Fragment>
      <h2 id="contest-heading" className="contest-heading">
        {props.name}
      </h2>
      {isFetchFailure && <ErrorMessage />}
      <div className="contest-table-scroll">
        <table
          className="contest-table"
          aria-labelledby="contest-heading"
          style={tableStyle}
        >
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.dataIndex} scope="col">
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contestTable.map((row) => (
              <tr key={row.key}>
                {columns.map((column) => (
                  <td key={column.dataIndex}>{row[column.dataIndex]}</td>
                ))}
              </tr>
            ))}
            {contestTable.length === 0 && (
              <tr className="contest-table-empty">
                <td colSpan={columns.length}>
                  <EmptyState />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {problemData.length > 0 && (
        <Pagination
          className="contest-pagination"
          align="end"
          current={current}
          pageSize={pageSize}
          pageSizeOptions={[10, 20, 50, 100, 150]}
          total={problemData.length}
          onChange={(next, size) => {
            setPage(next);
            setPageSize(size);
          }}
        />
      )}
    </React.Fragment>
  );
};

export default ContestTable;
