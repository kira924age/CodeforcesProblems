import React from "react";
import { MenuOutlined } from "@ant-design/icons";

import "./Hamburger.css";

const Hamburger: React.FunctionComponent = (props) => {
  return (
    <div id="hamburger-btn">
      <MenuOutlined />
    </div>
  );
};

export default Hamburger;
