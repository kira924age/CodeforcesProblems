import React from "react";
import Toggle from "react-toggle";
import clsx from "clsx";

import styles from "./ThemeToggleButton.module.scss";

type Props = {
  className?: string;
};

export const ThemeToggleButton: React.FC<Props> = ({ className }: Props) => {
  return (
    <div className={clsx(styles["theme-toggle-button"], className)}>
      <Toggle
        defaultChecked={true}
        icons={{
          checked: <span className={styles["toggle-icon"]}>🌜</span>,
          unchecked: <span className={styles["toggle-icon"]}>🌞</span>,
        }}
      />
    </div>
  );
};
