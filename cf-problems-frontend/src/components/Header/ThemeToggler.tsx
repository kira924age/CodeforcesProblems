import React from "react";

import Switch from "../ui/Switch";
import "./ThemeToggler.css";

import { ThemeContext, useTheme } from "../ThemeProvider";

const ThemeToggler = () => {
  const [, setThemeId] = React.useContext(ThemeContext);
  const theme = useTheme();

  return (
    <div className="theme-toggler">
      <Switch
        label="Dark theme"
        checked={theme === "dark"}
        onCheckedChange={(checked) => setThemeId(checked ? "dark" : "light")}
        checkedChildren="🌜"
        unCheckedChildren="🌞"
      />
    </div>
  );
};

export default ThemeToggler;
