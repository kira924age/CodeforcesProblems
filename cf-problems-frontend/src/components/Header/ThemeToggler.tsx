import React from "react";

import Toggle from "react-toggle";

import "react-toggle/style.css";
import "./ThemeToggler.css";

import { ThemeContext, useTheme } from "../ThemeProvider";

const ThemeToggler = () => {
  const [, setThemeId] = React.useContext(ThemeContext);
  const theme = useTheme();

  return (
    <>
      <div className="theme-toggler">
        <Toggle
          defaultChecked={theme === "dark"}
          onChange={() => {
            setThemeId(theme === "light" ? "dark" : "light");
          }}
          icons={{
            checked: <span className="toggle-icon">🌜</span>,
            unchecked: <span className="toggle-icon">🌞</span>,
          }}
        />
      </div>
    </>
  );
};

export default ThemeToggler;
