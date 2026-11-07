import type { TooltipContentProps } from "recharts";
import { ratingColors, getRatingColorCode } from "../../utils/colors";

import { formatDate } from "../../utils/formatDate";

type CustomTooltipProps = Pick<
  TooltipContentProps<number, string>,
  "active" | "payload" | "label"
>;

export const CustomTooltip: React.FunctionComponent<CustomTooltipProps> = (
  props
) => {
  const dateSecond = Number(props.label);
  if (!props.active || !props.payload.length || !Number.isFinite(dateSecond)) {
    return null;
  }

  // Keep the stack order regardless of Recharts' payload sorting defaults.
  const entries = ratingColors
    .slice()
    .reverse()
    .map((color) => {
      const name = color === "Black" ? "Other" : color;
      const value = props.payload.find(
        (entry) => entry.dataKey === name
      )?.value;
      return { name, color, value: typeof value === "number" ? value : 0 };
    });

  return (
    <div
      className="recharts-default-tooltip"
      style={{
        margin: "0px",
        padding: "10px",
        backgroundColor: "rgb(255, 255, 255)",
        color: "#333",
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
            {entries.reduce((total, entry) => total + entry.value, 0)}
          </span>
        </li>
      </ul>

      <hr style={{ marginTop: "0.3em", marginBottom: "0.3em" }} />

      <div>
        {entries.map((entry) => {
          if (entry.value <= 0) return null;
          return (
            <div
              key={entry.name}
              style={{ color: getRatingColorCode(entry.color) }}
            >
              {entry.name}
              {" : "}
              {entry.value}
            </div>
          );
        })}
      </div>
    </div>
  );
};
