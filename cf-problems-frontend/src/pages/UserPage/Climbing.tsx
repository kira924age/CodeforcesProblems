import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { ratingColors, getRatingColorCode } from "../../utils/colors";

import { CustomTooltip } from "./CustomTooltip";
import { formatDate } from "../../utils/formatDate";

interface Props {
  solvedHistory: object[];
}

const ClimbingChart: React.FunctionComponent<Props> = (props) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={props.solvedHistory}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="dateSecond"
          domain={["dataMin", "dataMax"]}
          type="number"
          tickFormatter={(dateSecond: number): string => formatDate(dateSecond)}
        />

        <YAxis />
        <Tooltip content={<CustomTooltip label={1} />} />

        {ratingColors.map((ratingColor) => {
          const colorCode: string = getRatingColorCode(ratingColor);
          return (
            <Area
              type="linear"
              isAnimationActive={false}
              key={ratingColor}
              dataKey={ratingColor === "Black" ? "Other" : ratingColor}
              stackId="1"
              stroke={colorCode}
              fill={colorCode}
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
};

interface Props {
  solvedHistory: object[];
}

const Climbing: React.FunctionComponent<Props> = (props: Props) => {
  return (
    <React.Fragment>
      <h3>Climbing</h3>
      <hr />
      <ClimbingChart solvedHistory={props.solvedHistory} />
    </React.Fragment>
  );
};

export default Climbing;
