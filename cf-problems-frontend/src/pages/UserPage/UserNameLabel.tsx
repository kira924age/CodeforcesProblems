import React from "react";
import { getRatingColorClass } from "../../utils/colors";
import { Tooltip } from "antd";

import TopcoderLikeCircle from "../../components/TopcoderLikeCircle";

interface Props {
  userId: string;
  rating: number;
}

const UserNameLabel: React.FunctionComponent<Props> = (props: Props) => {
  const c = getRatingColorClass(props.rating);
  const userRatingCircle =
    props.rating === undefined ? (
      <Tooltip title="Unrated" color="black">
        <div className="difficulty-unavailable-circle">
          <span className="big-difficulty-circle"></span>
        </div>
      </Tooltip>
    ) : (
      <Tooltip title={"Rating: " + String(props.rating)} color="black">
        <TopcoderLikeCircle rating={props.rating} big={true} />{" "}
      </Tooltip>
    );

  return (
    <h3>
      {userRatingCircle}{" "}
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={"https://codeforces.com/profile/" + props.userId}
        className={c}
      >
        {props.userId}
      </a>
    </h3>
  );
};

export default UserNameLabel;
