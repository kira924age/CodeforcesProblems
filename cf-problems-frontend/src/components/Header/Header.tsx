import React from "react";
import Hamburger from "./Hamburger";
import Logo from "./Logo";
import ThemeToggler from "./ThemeToggler";
import { Link, useNavigate } from "react-router";

import "./Header.css";
import "./InputBox.css";

interface Props {
  userId: string | undefined;
  location: string;
}

const Header: React.FunctionComponent<Props> = (props: Props) => {
  const [userId, setUserId] = React.useState(props.userId ?? "");

  React.useEffect(() => {
    setUserId(props.userId ?? "");
  }, [props.userId]);
  const [isOpen, setIsOpen] = React.useState(false);

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    setUserId(e.currentTarget.value);
  };

  const navigate = useNavigate();
  const isComposing = React.useRef(false);

  const handleEnter = () => {
    void navigate("/" + props.location + "/" + userId);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      event.key === "Enter" &&
      !isComposing.current &&
      !event.nativeEvent.isComposing &&
      event.keyCode !== 229
    ) {
      handleEnter();
    }
  };

  const toggleIsOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div id="header">
      <div className="header-row">
        <div className="header-logo">
          <Logo />
        </div>
        <div className="header-menu">
          <div id="input-box">
            <input
              className="header-input"
              type="text"
              placeholder="Codeforces ID"
              value={userId}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => {
                isComposing.current = true;
              }}
              onCompositionEnd={() => {
                isComposing.current = false;
              }}
            />

            <Link to={"/table/" + userId} replace>
              <button type="button" className="header-button">
                Table
              </button>
            </Link>
            {userId === "" ? (
              <Link
                to={"/user/" + userId}
                replace
                aria-disabled="true"
                tabIndex={-1}
                onClick={(event) => event.preventDefault()}
              >
                <button type="button" className="header-button" disabled>
                  User
                </button>
              </Link>
            ) : (
              <Link to={"/user/" + userId} replace>
                <button type="button" className="header-button">
                  User
                </button>
              </Link>
            )}
          </div>
          <ThemeToggler />
        </div>
        <div className="header-toggle">
          <Hamburger isOpen={isOpen} onToggle={toggleIsOpen} />
        </div>
      </div>
      {isOpen && (
        <div id="mobile-menu" className="mobile-menu">
          <div id="input-box">
            <input
              className="header-input"
              type="text"
              placeholder="Codeforces ID"
              value={userId}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => {
                isComposing.current = true;
              }}
              onCompositionEnd={() => {
                isComposing.current = false;
              }}
            />
            <Link to={"/table/" + userId} replace>
              <button type="button" className="header-button">
                Table
              </button>
            </Link>
            {userId === "" ? (
              <Link
                to={"/user/" + userId}
                replace
                aria-disabled="true"
                tabIndex={-1}
                onClick={(event) => event.preventDefault()}
              >
                <button type="button" className="header-button" disabled>
                  User
                </button>
              </Link>
            ) : (
              <Link to={"/user/" + userId} replace>
                <button type="button" className="header-button">
                  User
                </button>
              </Link>
            )}
          </div>
          <ThemeToggler />
        </div>
      )}
    </div>
  );
};

export default Header;
