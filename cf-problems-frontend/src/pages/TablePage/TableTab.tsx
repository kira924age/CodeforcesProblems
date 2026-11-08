import React from "react";

import { Radio, Switch } from "antd";

import ContestTable from "./ContestTable";
import "./TableTab.css";
import { useLocalStorage } from "../../utils/localStorage";

type Props = {
  userId: string;
};

const TableTabButtons: React.FunctionComponent<Props> = (props: Props) => {
  const [contest, setContest] = useLocalStorage(
    "activeTab",
    "Educational Codeforces Rounds"
  );

  const [isShowDifficulty, setIsShowDifficulty] = useLocalStorage(
    "isShowDifficulty",
    true
  );

  const [isReverseOrder, setIsReverseOrder] = useLocalStorage(
    "isReverseOrder",
    false
  );

  return (
    <React.Fragment>
      <div className="table-controls">
        <div className="table-control">
          {isShowDifficulty ? (
            <Switch
              size="small"
              defaultChecked
              onChange={() => {
                setIsShowDifficulty(!isShowDifficulty);
              }}
            />
          ) : (
            <Switch
              size="small"
              onChange={() => {
                setIsShowDifficulty(!isShowDifficulty);
              }}
            />
          )}

          <label>Show Difficulty</label>
        </div>

        <div className="table-control">
          {isReverseOrder ? (
            <Switch
              size="small"
              defaultChecked
              onChange={() => {
                setIsReverseOrder(!isReverseOrder);
              }}
            />
          ) : (
            <Switch
              size="small"
              onChange={() => {
                setIsReverseOrder(!isReverseOrder);
              }}
            />
          )}
          <label>Reverse Order</label>
        </div>
      </div>

      <Radio.Group
        value={contest}
        className="contest-categories"
        size="large"
        onChange={(e) => {
          setContest(e.target.value);
        }}
      >
        <Radio.Button value="Educational Codeforces Rounds">
          Educational
        </Radio.Button>
        <Radio.Button value="Codeforces Global Rounds">Global</Radio.Button>
        <Radio.Button value="Div. 1 + Div. 2 Contests">
          Div1 + Div2
        </Radio.Button>
        <Radio.Button value="Div. 1 Contests">Div1</Radio.Button>
        <Radio.Button value="Div. 2 Contests">Div2</Radio.Button>
        <Radio.Button value="Div. 3 Contests">Div3</Radio.Button>
        <Radio.Button value="Div. 4 Contests">Div4</Radio.Button>
        <Radio.Button value="ICPC">ICPC</Radio.Button>
        <Radio.Button value="Kotlin Heroes">Kotlin</Radio.Button>
        <Radio.Button value="Microsoft Q# Coding Contests">Q#</Radio.Button>
        <Radio.Button value="Other Contests">Others</Radio.Button>
        <Radio.Button value="All Contests">All</Radio.Button>
      </Radio.Group>

      <ContestTable
        name={contest}
        isShowDifficulty={isShowDifficulty}
        isReverseOrder={isReverseOrder}
        userId={props.userId}
      />
    </React.Fragment>
  );
};

export default TableTabButtons;
