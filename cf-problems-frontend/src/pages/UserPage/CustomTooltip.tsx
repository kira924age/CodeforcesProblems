import { ratingColors, getRatingColorCode } from "../../utils/colors";
import { formatDate } from "../../utils/formatDate";
import {
  pointTotal,
  seriesName,
  type SolvedHistoryPoint,
} from "./climbingChartConfig";

export const CustomTooltip = ({ point }: { point: SolvedHistoryPoint }) => (
  <div className="climbing-tooltip">
    <p>{formatDate(point.dateSecond)}</p>
    <div className="climbing-tooltip-total">count : {pointTotal(point)}</div>
    <hr />
    {ratingColors
      .slice()
      .reverse()
      .map((color) => {
        const name = seriesName(color);
        const value = point[name] ?? 0;
        return value > 0 ? (
          <div key={name} style={{ color: getRatingColorCode(color) }}>
            {name} : {value}
          </div>
        ) : null;
      })}
  </div>
);
