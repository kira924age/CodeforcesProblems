import React from "react";
import { Row, Col, Badge, Tooltip } from "antd";

interface Props {
  userId: string;
  solvedCountAll: number;
  solvedCountLastYear: number;
  solvedCountLastMonth: number;
  longestStreak: number;
  currentStreak: number;
  streakSum: number;
}

const colProps = {
  xxl: 8,
  xl: 8,
  lg: 8,
  md: 8,
  sm: 8,
  xs: 12,
};

const badge = (
  <Tooltip
    title="Counts and streaks use the first AC of each problem in your local time. Repeat ACs do not count. Previous month/year means the previous calendar month/year. Current Streak includes today; it is zero until you first solve a new problem today."
    color="black"
  >
    <span>
      <Badge
        title=""
        count="?"
        style={{ backgroundColor: "#6c757d", borderColor: "#6c757d" }}
      />
    </span>
  </Tooltip>
);

const Achievement: React.FunctionComponent<Props> = (props: Props) => {
  return (
    <React.Fragment>
      <h3>Achievements {badge}</h3>
      <hr />

      <Row gutter={10}>
        <Col {...colProps} key="solved-all" className="achievement-item">
          <h6>solved for all time</h6>
          <h4>{props.solvedCountAll} problems</h4>
        </Col>
        <Col {...colProps} key="solved-year" className="achievement-item">
          <h6>solved in the previous calendar year</h6>
          <h4>{props.solvedCountLastYear} problems</h4>
        </Col>
        <Col {...colProps} key="solved-month" className="achievement-item">
          <h6>solved in the previous calendar month</h6>
          <h4>{props.solvedCountLastMonth} problems</h4>
        </Col>
      </Row>
      <Row gutter={10}>
        <Col {...colProps} key="longest-streak" className="achievement-item">
          <h6>Longest Streak</h6>
          <h4>{props.longestStreak} days</h4>
        </Col>
        <Col {...colProps} key="current-streak" className="achievement-item">
          <h6>Current Streak</h6>
          <h4>{props.currentStreak} days</h4>
        </Col>
        <Col {...colProps} key="streak-sum" className="achievement-item">
          <h6>Streak Sum</h6>
          <h4>{props.streakSum} days</h4>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default Achievement;
