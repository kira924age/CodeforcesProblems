import React from "react";
import "./Logo.css";

import { Link } from "react-router-dom";

// src={process.env.PUBLIC_URL + "my_logo.png"
// src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
const Logo: React.FunctionComponent = (props) => {
  return (
    <h1 id="logo">
      <Link to="/table">
        <img alt="logo" src="../CF-like-logo.png" />
        CF Problems{" "}
      </Link>
    </h1>
  );
};

export default Logo;
