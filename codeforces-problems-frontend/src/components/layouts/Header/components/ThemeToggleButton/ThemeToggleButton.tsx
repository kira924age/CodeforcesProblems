import React from "react";
import Toggle from "react-toggle";
import clsx from "clsx";
import {
  useTheme,
  useSetTheme,
} from "../../../../../features/theme/hooks/useTheme";

import styles from "./ThemeToggleButton.module.scss";

type Props = {
  className?: string;
};

export const ThemeToggleButton: React.FC<Props> = ({ className }: Props) => {
  const theme = useTheme();
  const setTheme = useSetTheme();
  const [isDarkMode, setIsDarkMode] = React.useState(theme === "dark");
  const toggleDarkMode = () => {
    setTheme(isDarkMode ? "light" : "dark");
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={clsx(styles["theme-toggle-button"], className)}>
      <Toggle
        defaultChecked={isDarkMode}
        onChange={toggleDarkMode}
        icons={{
          checked: <span className={styles["toggle-icon"]}>🌜</span>,
          unchecked: <span className={styles["toggle-icon"]}>🌞</span>,
        }}
      />
    </div>
  );
};
