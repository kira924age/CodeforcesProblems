import React from "react";

import { ResponsiveCalendar } from "@nivo/calendar";
import { Select } from "antd";

interface Props {
  data: any[];
}

const Customtooltip = (x: any) => {
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
  data: any[];
  year: string;
}

const MyResponsiveCalendar = (props: CalendarProps) => {
  return (
    <ResponsiveCalendar
      data={props.data}
      from={props.year + "-01-01"}
      to={props.year + "-12-31"}
      emptyColor="#ebedf0"
      colors={["#C6E48B", "#7BC96F", "#239A3B", "#196127"]}
      minValue="auto"
      margin={{ top: 5, right: 5, bottom: 5, left: 25 }}
      yearSpacing={45}
      monthBorderColor="#ffffff"
      dayBorderWidth={2}
      dayBorderColor="#ffffff"
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
  const yearsSet: Set<string> = new Set();
  props.data.forEach((x) => {
    yearsSet.add(x.day.slice(0, 4));
  });

  let years: string[] = Array.from(yearsSet);
  years.reverse();

  const [selectYear, setSelectYear] = React.useState(years[0]);

  React.useEffect(() => {}, []);

  return (
    <React.Fragment>
      <h3>Heatmap</h3>
      <hr />

      <div style={{ height: 300, marginBottom: 50 }}>
        <div style={{ textAlign: "right", paddingTop: "20px" }}>
          {years.length > 0 && (
            <Select
              defaultValue="Choose year"
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
    </React.Fragment>
  );
};

export default Heatmap;
