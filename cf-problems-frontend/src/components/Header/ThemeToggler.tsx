import React from "react";

import { Switch } from "antd";
import "./ThemeToggler.css";

import { ThemeContext, useTheme } from "../ThemeProvider";

const ThemeToggler = () => {
  const [, setThemeId] = React.useContext(ThemeContext);
  const theme = useTheme();

  return (
    <div className="theme-toggler">
      <Switch
        aria-label="Dark theme"
        checked={theme === "dark"}
        onChange={(checked) => setThemeId(checked ? "dark" : "light")}
        checkedChildren="🌜"
        unCheckedChildren="🌞"
      />
    </div>
  );
};

export default ThemeToggler;
