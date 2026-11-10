import React from "react";

import { RadioGroup } from "radix-ui";
import Switch from "../../components/ui/Switch";

import ContestTable from "./ContestTable";
import "./TableTab.css";
import { useLocalStorage } from "../../utils/localStorage";

type Props = {
  submissions: Map<string, boolean>;
  isFetchFailure: boolean;
};

const TableTabButtons: React.FunctionComponent<Props> = (props: Props) => {
  const difficultyId = React.useId();
  const reverseOrderId = React.useId();
  const categories = React.useRef<HTMLDivElement>(null);
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

  React.useLayoutEffect(() => {
    const group = categories.current;
    if (!group) return;
    const tabs = Array.from(
      group.querySelectorAll<HTMLButtonElement>(".contest-category")
    );
    const markRows = () => {
      const offsets = tabs.map((tab) => tab.offsetTop);
      const lastRowStart = offsets.indexOf(offsets[offsets.length - 1]);
      tabs.forEach((tab, index) => {
        const top = offsets[index];
        tab.toggleAttribute("data-last-row", index >= lastRowStart);
        tab.toggleAttribute(
          "data-first-row-end",
          top === offsets[0] && top !== offsets[index + 1]
        );
        tab.toggleAttribute("data-last-row-start", index === lastRowStart);
      });

      // Measure after the last row has stopped stretching.
      const previousEnd = tabs[lastRowStart - 1];
      const lastEnd = tabs.at(-1);
      const exposedEnd =
        previousEnd &&
        lastEnd &&
        previousEnd.getBoundingClientRect().right -
          lastEnd.getBoundingClientRect().right >=
          6
          ? previousEnd
          : undefined;
      tabs.forEach((tab) => {
        tab.toggleAttribute("data-exposed-bottom-end", tab === exposedEnd);
      });
    };
    markRows();
    const observer = new ResizeObserver(markRows);
    observer.observe(group);
    tabs.forEach((tab) => observer.observe(tab));
    return () => observer.disconnect();
  }, []);

  return (
    <React.Fragment>
      <div className="table-controls">
        <div className="table-control">
          <Switch
            size="small"
            id={difficultyId}
            label="Show Difficulty"
            checked={isShowDifficulty}
            onCheckedChange={setIsShowDifficulty}
          />

          <label htmlFor={difficultyId}>Show Difficulty</label>
        </div>

        <div className="table-control">
          <Switch
            size="small"
            id={reverseOrderId}
            label="Reverse Order"
            checked={isReverseOrder}
            onCheckedChange={setIsReverseOrder}
          />
          <label htmlFor={reverseOrderId}>Reverse Order</label>
        </div>
      </div>

      <RadioGroup.Root
        ref={categories}
        aria-label="Contest category"
        value={contest}
        className="contest-categories"
        onValueChange={setContest}
      >
        <RadioGroup.Item
          className="contest-category"
          value="Educational Codeforces Rounds"
        >
          Educational
        </RadioGroup.Item>
        <RadioGroup.Item
          className="contest-category"
          value="Codeforces Global Rounds"
        >
          Global
        </RadioGroup.Item>
        <RadioGroup.Item
          className="contest-category"
          value="Div. 1 + Div. 2 Contests"
        >
          Div1 + Div2
        </RadioGroup.Item>
        <RadioGroup.Item className="contest-category" value="Div. 1 Contests">
          Div1
        </RadioGroup.Item>
        <RadioGroup.Item className="contest-category" value="Div. 2 Contests">
          Div2
        </RadioGroup.Item>
        <RadioGroup.Item className="contest-category" value="Div. 3 Contests">
          Div3
        </RadioGroup.Item>
        <RadioGroup.Item className="contest-category" value="Div. 4 Contests">
          Div4
        </RadioGroup.Item>
        <RadioGroup.Item className="contest-category" value="ICPC">
          ICPC
        </RadioGroup.Item>
        <RadioGroup.Item className="contest-category" value="Kotlin Heroes">
          Kotlin
        </RadioGroup.Item>
        <RadioGroup.Item
          className="contest-category"
          value="Microsoft Q# Coding Contests"
        >
          Q#
        </RadioGroup.Item>
        <RadioGroup.Item className="contest-category" value="Other Contests">
          Others
        </RadioGroup.Item>
        <RadioGroup.Item className="contest-category" value="All Contests">
          All
        </RadioGroup.Item>
      </RadioGroup.Root>

      <ContestTable
        name={contest}
        isShowDifficulty={isShowDifficulty}
        isReverseOrder={isReverseOrder}
        submissions={props.submissions}
        isFetchFailure={props.isFetchFailure}
      />
    </React.Fragment>
  );
};

export default TableTabButtons;
