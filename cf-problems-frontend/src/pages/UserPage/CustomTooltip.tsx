import { ratingColors, getRatingColorCode } from "../../utils/colors";
import { formatDate } from "../../utils/formatDate";
import { pointTotal, type SolvedHistoryPoint } from "./climbingChartUtils";
export const CustomTooltip = ({
  point,
  id,
}: {
  point: SolvedHistoryPoint;
  id: string;
}) => (
  <div className="climbing-tooltip" role="tooltip" id={id}>
    <p>{formatDate(point.dateSecond)}</p>
    <p className="climbing-tooltip-total">count : {pointTotal(point)}</p>
    <hr />
    {ratingColors
      .slice()
      .reverse()
      .map((color) => {
        const name = color === "Black" ? "Other" : color;
        const value = point[name] ?? 0;
        return value > 0 ? (
          <div key={name} style={{ color: getRatingColorCode(color) }}>
            {name} : {value}
          </div>
        ) : null;
      })}
  </div>
);
