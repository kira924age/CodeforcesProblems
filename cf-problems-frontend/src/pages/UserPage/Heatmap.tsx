import React from "react";

import { ResponsiveCalendar } from "@nivo/calendar";
import type { CalendarDatum, CalendarTooltipProps } from "@nivo/calendar";
import { Select } from "antd";
import { useTheme } from "../../components/ThemeProvider";

interface Props {
  data: CalendarDatum[];
}

const Customtooltip = (x: CalendarTooltipProps) => {
  return (
    <React.Fragment>
      {x.value ? (
        <div
          style={{
            background: "black",
            color: "white",
            padding: "8px",
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          {x.day}
          <br />
          {x.value} submissions
        </div>
      ) : null}
    </React.Fragment>
  );
};

interface CalendarProps {
  data: CalendarDatum[];
  year: string;
}

const MyResponsiveCalendar = (props: CalendarProps) => {
  const theme = useTheme();

  return (
    <ResponsiveCalendar
      data={props.data}
      from={props.year + "-01-01"}
      to={props.year + "-12-31"}
      emptyColor="#ebedf0"
      colors={["#C6E48B", "#7BC96F", "#239A3B", "#196127"]}
      minValue="auto"
      theme={{ text: { fill: theme === "dark" ? "#fff" : "#333" } }}
      margin={{ top: 5, right: 5, bottom: 5, left: 25 }}
      yearSpacing={45}
      dayBorderWidth={0.5}
      dayBorderColor={theme === "dark" ? "#333" : "#fff"}
      monthBorderWidth={0}
      tooltip={Customtooltip}
      legends={[
        {
          anchor: "bottom-right",
          direction: "row",
          translateY: 36,
          itemCount: 4,
          itemWidth: 42,
          itemHeight: 36,
          itemsSpacing: 14,
          itemDirection: "right-to-left",
        },
      ]}
    />
  );
};

const Heatmap: React.FunctionComponent<Props> = (props: Props) => {
  const years = [...new Set(props.data.map((x) => x.day.slice(0, 4)))]
    .sort()
    .reverse();
  const [selectedYear, setSelectYear] = React.useState<string>();
  const selectYear =
    selectedYear && years.includes(selectedYear) ? selectedYear : years[0];

  return (
    <React.Fragment>
      <h3>Heatmap</h3>
      <hr />

      {selectYear ? (
        <div style={{ height: 300, marginBottom: 50 }}>
          <div style={{ textAlign: "right", paddingTop: "20px" }}>
            {years.length > 0 && (
              <Select
                aria-label="Heatmap year"
                value={selectYear}
                style={{ width: 150, textAlign: "left" }}
                onChange={(value) => {
                  setSelectYear(value);
                }}
              >
                {years.map((year: string) => (
                  <Select.Option value={year} key={year}>
                    {year}
                  </Select.Option>
                ))}
              </Select>
            )}
          </div>

          <MyResponsiveCalendar data={props.data} year={selectYear} />
        </div>
      ) : (
        <p>No submissions yet.</p>
      )}
    </React.Fragment>
  );
};

export default Heatmap;
