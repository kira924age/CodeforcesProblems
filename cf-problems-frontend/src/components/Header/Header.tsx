import React from "react";
import Hamburger from "./Hamburger";
import Logo from "./Logo";
import ThemeToggler from "./ThemeToggler";
import { Row, Col } from "antd";
import { Link, useNavigate } from "react-router";

import "./Header.css";
import "./InputBox.css";

const colProps = [
  {
    xxl: 4,
    xl: 5,
    lg: 6,
    md: 6,
    sm: 8,
    xs: 20,
  },
  {
    xxl: 20,
    xl: 19,
    lg: 18,
    md: 18,
    sm: 16,
    xs: 0,
  },
  {
    xxl: 0,
    xl: 0,
    lg: 0,
    md: 0,
    sm: 0,
    xs: 4,
  },
];

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
      <Row style={{ flexFlow: "nowrap", height: 56 }}>
        <Col {...colProps[0]}>
          <Logo />
        </Col>
        <Col {...colProps[1]} className="menu-row" style={{ display: "flex" }}>
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
        </Col>
        <Col {...colProps[2]}>
          <Hamburger isOpen={isOpen} onToggle={toggleIsOpen} />
        </Col>
      </Row>
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
