import React from "react";
import { getRatingColorClass } from "../../utils/colors";
import Tooltip from "../../components/ui/Tooltip";

import TopcoderLikeCircle from "../../components/TopcoderLikeCircle";
import "./UserNameLabel.css";

interface Props {
  userId: string;
  rating: number;
}

const UserNameLabel: React.FunctionComponent<Props> = (props: Props) => {
  const c = getRatingColorClass(props.rating);
  const userRatingCircle =
    props.rating === undefined ? (
      <Tooltip title="Unrated">
        <span className="big-difficulty-circle difficulty-unavailable-circle" />
      </Tooltip>
    ) : (
      <Tooltip title={"Rating: " + String(props.rating)}>
        <TopcoderLikeCircle rating={props.rating} big />
      </Tooltip>
    );

  return (
    <h3 className="user-name-label">
      {userRatingCircle}
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
