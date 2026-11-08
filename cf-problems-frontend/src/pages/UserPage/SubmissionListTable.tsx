import React from "react";
import { Empty, Pagination, theme } from "antd";
import DifficultyCircle from "../../components/DifficultyCircle";
import { getRatingColorClass } from "../../utils/colors";
import { formatFullDate } from "../../utils/formatDate";
import "./SubmissionListTable.css";

interface Submission {
  submissionId: number;
  creationTimeSeconds: number;
  problem: {
    contestId?: number;
    index: string;
    name: string;
    rating?: number;
  };
  verdict?: string;
  programmingLanguage: string;
}

interface Props {
  submission: Submission[];
}

const rejectedVerdicts: Record<string, string> = {
  WRONG_ANSWER: "Wrong answer",
  TIME_LIMIT_EXCEEDED: "Time limit exceeded",
  COMPILATION_ERROR: "Compilation error",
  MEMORY_LIMIT_EXCEEDED: "Memory limit exceeded",
  RUNTIME_ERROR: "Runtime error",
  PRESENTATION_ERROR: "Presentation error",
  IDLENESS_LIMIT_EXCEEDED: "Idleness limit exceeded",
};

const Verdict = ({ verdict }: { verdict?: string }) => {
  if (verdict === "OK") {
    return <div className="verdict-accepted">Accepted</div>;
  }
  if (verdict && Object.hasOwn(rejectedVerdicts, verdict)) {
    return <div className="verdict-rejected">{rejectedVerdicts[verdict]}</div>;
  }
  return <>{verdict ?? "unknown"}</>;
};

const SubmissionListTable: React.FunctionComponent<Props> = ({
  submission,
}) => {
  const { token } = theme.useToken();
  const tableStyle = {
    "--submission-link-color": token.colorLink,
    "--submission-link-hover-color": token.colorLinkHover,
    "--submission-link-active-color": token.colorLinkActive,
  } as React.CSSProperties;
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });
  // Match Table's page clamping when the data length changes.
  const current = Math.min(
    pagination.current,
    Math.max(1, Math.ceil(submission.length / pagination.pageSize))
  );
  const start = (current - 1) * pagination.pageSize;
  const visibleSubmissions = submission.slice(
    start,
    start + pagination.pageSize
  );

  return (
    <>
      <h3 id="submissions-heading">Submissions</h3>
      <hr />
      <br />
      <div className="submission-table-scroll">
        <table
          className="submission-table"
          aria-labelledby="submissions-heading"
          style={tableStyle}
        >
          <thead>
            <tr>
              {["Date", "Problem", "Verdict", "Language", "Detail"].map(
                (title) => (
                  <th key={title} scope="col">
                    {title}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {visibleSubmissions.map((entry) => {
              const contestUrl = `https://codeforces.com/contest/${entry.problem.contestId}`;
              return (
                <tr key={entry.submissionId}>
                  <td>
                    <div className="cell-element">
                      {formatFullDate(entry.creationTimeSeconds)}
                    </div>
                  </td>
                  <td>
                    <div className="cell-element">
                      <DifficultyCircle rating={entry.problem.rating} />
                      <a
                        href={`${contestUrl}/problem/${entry.problem.index}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={getRatingColorClass(entry.problem.rating)}
                      >
                        {`${entry.problem.index}. ${entry.problem.name}`}
                      </a>
                    </div>
                  </td>
                  <td>
                    <div className="cell-element">
                      <Verdict verdict={entry.verdict} />
                    </div>
                  </td>
                  <td>
                    <div className="cell-element">
                      {String(entry.programmingLanguage)}
                    </div>
                  </td>
                  <td>
                    <div className="cell-element">
                      <a
                        href={`${contestUrl}/submission/${entry.submissionId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Detail
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
            {submission.length === 0 && (
              <tr className="submission-table-empty">
                <td colSpan={5}>
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {submission.length > 0 && (
        <Pagination
          className="submission-pagination"
          align="end"
          current={current}
          pageSize={pagination.pageSize}
          total={submission.length}
          onChange={(next, pageSize) =>
            setPagination({ current: next, pageSize })
          }
        />
      )}
    </>
  );
};

export default SubmissionListTable;
