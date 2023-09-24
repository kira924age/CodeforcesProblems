import React from "react";
import { Header } from "./Header";

import styles from "./Layout.module.scss";

export const Layout: React.FC = () => {
  return (
    <div className={styles["layout"]}>
      <Header />
    </div>
  );
};
