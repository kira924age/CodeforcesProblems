import React from "react";
import { MenuOutlined } from "@ant-design/icons";

import "./Hamburger.css";

interface Props {
  isOpen: boolean;
  onToggle: () => void;
}

const Hamburger: React.FunctionComponent<Props> = ({ isOpen, onToggle }) => {
  return (
    <button
      id="hamburger-btn"
      type="button"
      aria-label="Toggle navigation"
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
      onClick={onToggle}
    >
      <MenuOutlined />
    </button>
  );
};

export default Hamburger;
