import React from "react";

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
      <svg
        className="hamburger-icon"
        viewBox="64 64 896 896"
        aria-hidden="true"
        focusable="false"
      >
        <rect x="112" y="160" width="800" height="80" rx="8" />
        <rect x="112" y="472" width="800" height="80" rx="8" />
        <rect x="112" y="784" width="800" height="80" rx="8" />
      </svg>
    </button>
  );
};

export default Hamburger;
