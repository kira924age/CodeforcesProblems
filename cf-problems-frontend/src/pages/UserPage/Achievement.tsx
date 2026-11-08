import React from "react";
import Tooltip from "../../components/ui/Tooltip";
import "./Achievement.css";

interface Props {
  userId: string;
  solvedCountAll: number;
  solvedCountLastYear: number;
  solvedCountLastMonth: number;
  longestStreak: number;
  currentStreak: number;
  streakSum: number;
}

const badge = (
  <Tooltip title="Counts and streaks use the first AC of each problem in your local time. Repeat ACs do not count. Previous month/year means the previous calendar month/year. Current Streak includes today; it is zero until you first solve a new problem today.">
    <span>
      <span
        className="achievement-help"
        role="img"
        aria-label="About achievement calculations"
      >
        ?
      </span>
    </span>
  </Tooltip>
);

const Achievement: React.FunctionComponent<Props> = (props: Props) => {
  return (
    <React.Fragment>
      <h3>Achievements {badge}</h3>
      <hr />

      <div className="achievement-row">
        <div key="solved-all" className="achievement-item">
          <h6>solved for all time</h6>
          <h4>{props.solvedCountAll} problems</h4>
        </div>
        <div key="solved-year" className="achievement-item">
          <h6>solved in the previous calendar year</h6>
          <h4>{props.solvedCountLastYear} problems</h4>
        </div>
        <div key="solved-month" className="achievement-item">
          <h6>solved in the previous calendar month</h6>
          <h4>{props.solvedCountLastMonth} problems</h4>
        </div>
      </div>
      <div className="achievement-row">
        <div key="longest-streak" className="achievement-item">
          <h6>Longest Streak</h6>
          <h4>{props.longestStreak} days</h4>
        </div>
        <div key="current-streak" className="achievement-item">
          <h6>Current Streak</h6>
          <h4>{props.currentStreak} days</h4>
        </div>
        <div key="streak-sum" className="achievement-item">
          <h6>Streak Sum</h6>
          <h4>{props.streakSum} days</h4>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Achievement;
