import React from "react";

import { ThemeContext, SetThemeContext } from "../ThemeProvider";

export const useTheme = () => {
  const theme = React.useContext(ThemeContext);
  const setTheme = React.useContext(SetThemeContext);

  const providerValue = React.useMemo(
    () => [theme, setTheme],
    [theme, setTheme],
  );

  return providerValue;
};
