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
        <span className="common-difficulty-circle difficulty-unavailable-circle"></span>
      </Tooltip>
    );
  }
  return (
    <Tooltip title={"Difficulty :" + String(props.rating)} color="black">
      <span>
        <TopcoderLikeCircle rating={props.rating} />
      </span>
    </Tooltip>
  );
};

export default DifficultyCircle;
