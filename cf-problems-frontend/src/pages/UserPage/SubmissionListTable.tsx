import React from "react";

import { Table } from "antd";
import DifficultyCircle from "../../components/DifficultyCircle";
import { getRatingColorClass } from "../../utils/colors";
import { formatFullDate } from "../../utils/formatDate";

const columns = [
  {
    title: "Date",
    dataIndex: "creationTimeSeconds",
    key: "creationTimeSeconds",
  },
  {
    title: "Problem",
    dataIndex: "problem",
    key: "problem",
  },
  {
    title: "Verdict",
    dataIndex: "verdict",
    key: "verdict",
  },
  {
    title: "Language",
    dataIndex: "programmingLanguage",
    key: "programmingLanguage",
  },
  {
    title: "Detail",
    dataIndex: "detail",
    key: "detail",
  },
];

interface Props {
  submission: any[];
}

const SubmissionListTable: React.FunctionComponent<Props> = (props: Props) => {
  const dataSource = props.submission.map((x) => {
    const submissionSecond = x.creationTimeSeconds;
    const rating: number | undefined = x.problem.rating;
    const difficultyCircle = <DifficultyCircle rating={x.problem.rating} />;

    const contestId: string = String(x.problem.contestId);
    const problemIndex: string = String(x.problem.index);
    const submissionId: string = String(x.submissionId);
    const submissionUrl: string =
      "https://codeforces.com/contest/" +
      contestId +
      "/submission/" +
      submissionId;
    const problemUrl: string =
      "https://codeforces.com/contest/" +
      contestId +
      "/problem/" +
      problemIndex;

    let verdict = x.verdict;
    switch (verdict) {
      case undefined:
        verdict = "unknown";
        break;
      case "OK":
        verdict = <div className="verdict-accepted">Accepted</div>;
        break;
      case "WRONG_ANSWER":
        verdict = <div className="verdict-rejected">Wrong answer</div>;
        break;
      case "TIME_LIMIT_EXCEEDED":
        verdict = <div className="verdict-rejected">Time limit exceeded</div>;
        break;
      case "COMPILATION_ERROR":
        verdict = <div className="verdict-rejected">Compilation error</div>;
        break;
      case "MEMORY_LIMIT_EXCEEDED":
        verdict = <div className="verdict-rejected">Memory limit exceeded</div>;
        break;
      case "RUNTIME_ERROR":
        verdict = <div className="verdict-rejected">Runtime error</div>;
        break;
      case "PRESENTATION_ERROR":
        verdict = <div className="verdict-rejected">Presentation error</div>;
        break;
      case "IDLENESS_LIMIT_EXCEEDED":
        verdict = (
          <div className="verdict-rejected">Idleness limit exceeded</div>
        );
        break;
    }

    const obj = {
      key: String(x.creationTimeSeconds),
      creationTimeSeconds: (
        <div className="cell-element">{formatFullDate(submissionSecond)}</div>
      ),
      problem: (
        <div className="cell-element">
          {difficultyCircle}
          <a
            href={problemUrl}
            target="_blank"
            rel="noopenner noreferrer"
            className={getRatingColorClass(rating)}
          >
            {String(x.problem.index) + ". " + String(x.problem.name)}
          </a>
        </div>
      ),
      programmingLanguage: (
        <div className="cell-element">{String(x.programmingLanguage)}</div>
      ),
      verdict: <div className="cell-element">{verdict}</div>,
      detail: (
        <div className="cell-element">
          <a href={submissionUrl} target="_blank" rel="noopenner noreferrer">
            Detail
          </a>
        </div>
      ),
    };
    return obj;
  });

  return (
    <React.Fragment>
      <h3>Submissions</h3>
      <hr />
      <br />
      <Table bordered={true} dataSource={dataSource} columns={columns} />
    </React.Fragment>
  );
};

export default SubmissionListTable;
