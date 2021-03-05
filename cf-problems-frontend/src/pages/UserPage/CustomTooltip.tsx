import { RatingColor, getRatingColorCode } from "../../utils/colors";

import { formatDate } from "../../utils/formatDate";

interface DailyEffortTooltipPayload {
  value: number;
  dataKey: RatingColor;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: DailyEffortTooltipPayload[];
  label: number;
}

export const CustomTooltip: React.FunctionComponent<CustomTooltipProps> = (
  props
) => {
  if (!props.active || props.payload === undefined) return null;

  const dateSecond = props.label;

  return (
    <div
      className="recharts-default-tooltip"
      style={{
        margin: "0px",
        padding: "10px",
        backgroundColor: "rgb(255, 255, 255)",
        border: "1px solid rgb(204, 204, 204)",
        whiteSpace: "nowrap",
      }}
    >
      <p className="recharts-tooltip-label" style={{ margin: "0px" }}>
        {formatDate(dateSecond)}
      </p>

      <ul
        className="recharts-tooltip-item-list"
        style={{ padding: "0px", margin: "0px" }}
      >
        <li
          className="recharts-tooltip-item"
          style={{
            display: "block",
            paddingTop: "4px",
            paddingBottom: "4px",
            color: "rgb(136, 132, 216)",
          }}
        >
          <span className="recharts-tooltip-item-name">count</span>
          <span className="recharts-tooltip-item-separator"> : </span>
          <span className="recharts-tooltip-item-value">
            {props.payload.reduce(
              (acc: number, entry: DailyEffortTooltipPayload) =>
                acc + entry.value,
              0
            )}
          </span>
        </li>
      </ul>

      <hr style={{ marginTop: "0.3em", marginBottom: "0.3em" }} />

      <div>
        {props.payload &&
          props.payload
            .slice()
            .reverse()
            .map((entry: DailyEffortTooltipPayload) => {
              if (entry.value <= 0) return null;
              return (
                <div
                  key={entry.dataKey}
                  style={{ color: getRatingColorCode(entry.dataKey) }}
                >
                  {entry.dataKey === "Black" ? "Other" : entry.dataKey}
                  {" : "}
                  {entry.value}
                </div>
              );
            })}
      </div>
    </div>
  );
};
