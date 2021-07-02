import React from "react";

import { Radio, Switch } from "antd";

import ContestTable from "./ContestTable";
import { useLocalStorage } from "../../utils/localStorage";

interface Props {
  userId: string | undefined;
}

const TableTabButtons: React.FunctionComponent<Props> = (props: Props) => {
  const [contest, setContest] = React.useState("Educational Codeforces Rounds");
  const [isShowDifficulty, setIsShowDifficulty] = useLocalStorage(
    "isShowDifficulty",
    true
  );

  return (
    <React.Fragment>
      <div>
        <div className="show-diff-btn">
          {isShowDifficulty ? (
            <Switch
              size="small"
              defaultChecked
              onChange={(e) => {
                setIsShowDifficulty(!isShowDifficulty);
              }}
            />
          ) : (
            <Switch
              size="small"
              onChange={(e) => {
                setIsShowDifficulty(!isShowDifficulty);
              }}
            />
          )}
        </div>
        <label className="show-diff-btn">Show Difficulty</label>
      </div>

      <Radio.Group
        value={contest}
        id="radio-buttons"
        size="large"
        onChange={(e) => {
          setContest(e.target.value);
        }}
      >
        <Radio.Button value="Educational Codeforces Rounds">Educational</Radio.Button>
        <Radio.Button value="Codeforces Global Rounds">Global</Radio.Button>
        <Radio.Button value="Div. 1 + Div. 2 Contests">Div1 + Div2</Radio.Button>
        <Radio.Button value="Div. 1 Contests">Div1</Radio.Button>
        <Radio.Button value="Div. 2 Contests">Div2</Radio.Button>
        <Radio.Button value="Div. 3 Contests">Div3</Radio.Button>
        <Radio.Button value="Div. 4 Contests">Div4</Radio.Button>
        <Radio.Button value="Kotlin Heroes">Kotlin</Radio.Button>
        <Radio.Button value="ICPC">ICPC</Radio.Button>
        <Radio.Button value="Microsoft Q# Coding Contests">Q#</Radio.Button>
        <Radio.Button value="Other Contests">other</Radio.Button>
        <Radio.Button value="All Contests">All</Radio.Button>
      </Radio.Group>

      <ContestTable
        name={contest}
        isShowDifficulty={isShowDifficulty}
        userId={props.userId}
      />
    </React.Fragment>
  );
};

export default TableTabButtons;
