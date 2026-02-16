export type RatingColor =
  | "Black"
  | "Grey"
  | "Green"
  | "Cyan"
  | "Blue"
  | "Violet"
  | "Orange"
  | "Red";

export const ratingColors: RatingColor[] = [
  "Red",
  "Orange",
  "Violet",
  "Blue",
  "Cyan",
  "Green",
  "Grey",
  "Black",
];

export const getRatingColorCode = (color: RatingColor): string => {
  switch (color) {
    case "Black":
      return "#000000";
    case "Grey":
      return "#808080";
    case "Green":
      return "#008000";
    case "Cyan":
      return "#03A89E";
    case "Blue":
      return "#0000FF";
    case "Violet":
      return "#AA00AA";
    case "Orange":
      return "#FF8C00";
    case "Red":
      return "#FF0000";
  }
};

export const getRatingColor = (rating: number | undefined): RatingColor => {
  let ratingColor: RatingColor;

  if (rating === undefined) {
    ratingColor = "Black";
  } else if (rating < 1200) {
    ratingColor = "Grey";
  } else if (rating < 1400) {
    ratingColor = "Green";
  } else if (rating < 1600) {
    ratingColor = "Cyan";
  } else if (rating < 1900) {
    ratingColor = "Blue";
  } else if (rating < 2100) {
    ratingColor = "Violet";
  } else if (rating < 2400) {
    ratingColor = "Orange";
  } else {
    ratingColor = "Red";
  }

  return ratingColor;
};

export type RatingColorClassName =
  | "difficulty-black"
  | "difficulty-grey"
  | "difficulty-green"
  | "difficulty-cyan"
  | "difficulty-blue"
  | "difficulty-violet"
  | "difficulty-orange"
  | "difficulty-red";

export const getRatingColorClass = (
  rating: number | undefined,
): RatingColorClassName => {
  const ratingColor: RatingColor = getRatingColor(rating);
  switch (ratingColor) {
    case "Black":
      return "difficulty-black";
    case "Grey":
      return "difficulty-grey";
    case "Green":
      return "difficulty-green";
    case "Cyan":
      return "difficulty-cyan";
    case "Blue":
      return "difficulty-blue";
    case "Violet":
      return "difficulty-violet";
    case "Orange":
      return "difficulty-orange";
    case "Red":
      return "difficulty-red";
  }
};
