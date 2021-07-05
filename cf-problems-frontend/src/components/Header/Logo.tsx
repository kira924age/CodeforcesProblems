import React from "react";
import "./Logo.css";

import { Link } from "react-router-dom";

const Logo: React.FunctionComponent = (props) => {
  return (
    <h1 id="logo">
      <Link to="/table">
        Codeforces Problems
      </Link>
    </h1>
  );
};

export default Logo;
