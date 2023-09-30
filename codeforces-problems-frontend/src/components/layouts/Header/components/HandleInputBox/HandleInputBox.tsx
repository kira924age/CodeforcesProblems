import React from "react";

import styles from "./HandleInputBox.module.scss";

export const HandleInputBox: React.FC = () => {
  // const [value, setValue] = React.useState("")

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setValue(e.target.value)
  // }
  // <input value={value} onChange={handleChange} />

  return (
    <div className={styles["handle-input-form"]}>
      <input type="text" />
    </div>
  );
};
