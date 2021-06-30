import React from "react";

function getColor(difficulty: number | undefined): string {
  let color: string;

  if (difficulty === undefined) {
    color = "black";
  } else if (difficulty < 1200) {
    color = "grey";
  } else if (difficulty < 1400) {
    color = "green";
  } else if (difficulty < 1600) {
    color = "cyan";
  } else if (difficulty < 1900) {
    color = "blue";
  } else if (difficulty < 2100) {
    color = "violet";
  } else if (difficulty < 2400) {
    color = "orange";
  } else if (difficulty < 2600) {
    color = "red";
  } else if (difficulty < 2900) {
    color = "bronze";
  } else if (difficulty < 3200) {
    color = "silver";
  } else {
    color = "gold";
  }

  return color;
}

function getColorCode(difficulty: number): string {
  let color: string;

  if (difficulty < 1200) {
    color = "#808080";
  } else if (difficulty < 1400) {
    color = "#008000";
  } else if (difficulty < 1600) {
    color = "#03A89E";
  } else if (difficulty < 1900) {
    color = "#0000FF";
  } else if (difficulty < 2100) {
    color = "#AA00AA";
  } else if (difficulty < 2400) {
    color = "#FF8C00";
  } else if (difficulty < 2600) {
    color = "#FF0000";
  } else if (difficulty < 2900) {
    color = "#965C2C";
  } else if (difficulty < 3200) {
    color = "#808080";
  } else {
    color = "#FFD700";
  }

  return color;
}

function calcFillRatio(difficulty: number): number {
  let fillRatio: number = 0;

  if (difficulty < 1200) {
    fillRatio = difficulty / 1200;
  } else if (difficulty < 1400) {
    fillRatio = 1 - (1400 - difficulty) / 200;
  } else if (difficulty < 1600) {
    fillRatio = 1 - (1600 - difficulty) / 200;
  } else if (difficulty < 1900) {
    fillRatio = 1 - (1900 - difficulty) / 300;
  } else if (difficulty < 2100) {
    fillRatio = 1 - (2100 - difficulty) / 200;
  } else if (difficulty < 2400) {
    fillRatio = 1 - (2400 - difficulty) / 300;
  } else if (difficulty < 2600) {
    fillRatio = 1 - (2600 - difficulty) / 200;
  } else {
    fillRatio = 1.0;
  }

  return fillRatio;
}

interface Props {
  rating: number;
  // optional props
  big?: boolean;
}

const TopcoderLikeCircle: React.FunctionComponent<Props> = (props) => {
  const color = getColor(props.rating);

  const colorCode = getColorCode(props.rating);
  const fillRatio = calcFillRatio(props.rating);

  const isMetal = color === "bronze" || color === "silver" || color === "gold";

  let metalOption = {
    base: "",
    highlight: "",
  };
  if (color === "bronze") {
    metalOption = { base: "#965C2C", highlight: "#FFDABD" };
  }
  if (color === "silver") {
    metalOption = { base: "#808080", highlight: "white" };
  }
  if (color === "gold") {
    metalOption = { base: "#FFD700", highlight: "white" };
  }

  const styles = isMetal
    ? {
        borderColor: colorCode,
        background: `linear-gradient(to right, \
        ${metalOption.base}, ${metalOption.highlight}, ${metalOption.base}`,
        color: colorCode,
      }
    : {
        borderColor: colorCode,
        borderStyle: "solid",
        background: `linear-gradient(to top, \
        ${colorCode} 0%, \
        ${colorCode} ${fillRatio * 100}%, \
        rgba(0,0,0,0) ${fillRatio * 100}%, \
        rgba(0,0,0,0) 100%)`,
        color: colorCode,
      };
  return (
    <span
     className={
        props.big ? "big-difficulty-circle" : "common-difficulty-circle"
      }
      style={styles}
    ></span>
  );
};

// default Props
TopcoderLikeCircle.defaultProps = {
  big: false,
};

export default TopcoderLikeCircle;
