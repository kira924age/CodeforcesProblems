import React from "react";
import { Tooltip } from "antd";

import TopcoderLikeCircle from "./TopcoderLikeCircle";

interface Props {
  rating: number | undefined;
}

const DifficultyCircle: React.FunctionComponent<Props> = (props) => {
  if (props.rating === undefined) {
    return (
      <Tooltip title="Difficulty is unavailable." color="black">
        <div className="difficulty-unavailable-circle">
          <span className="common-difficulty-circle"></span>
        </div>
      </Tooltip>
    );
  }
  return (
    <Tooltip title={"Difficulty :" + String(props.rating)} color="black">
      <div className="div-diff-circle">
        <TopcoderLikeCircle rating={props.rating} />
      </div>
    </Tooltip>
  );
};

export default DifficultyCircle;
