import React from "react";

import { ThemeContext, SetThemeContext } from "../ThemeProvider";

export const useTheme = () => {
  return React.useContext(ThemeContext);
};

export const useSetTheme = () => {
  return React.useContext(SetThemeContext);
};
