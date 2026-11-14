import { Link, NavLink, useMatch } from "react-router";
import { DropdownMenu } from "radix-ui";
import ThemeToggler from "./ThemeToggler";
import "./Header.css";

const Header = () => {
  const isAbout = useMatch("/about");
  const isChangelog = useMatch("/changelog");
  return (
    <>
      <header className="site-header">
        <Link className="site-brand" to="/">
          <img
            className="site-brand-logo"
            src={`${import.meta.env.BASE_URL}favicon-32x32.png`}
            width="24"
            height="24"
            alt=""
          />
          Codeforces Problems
        </Link>
      </header>
      <nav className="site-nav" aria-label="Main navigation">
        <NavLink to="/" end>
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path d="M6 5h7M6 9h7M6 13h7M3 5h.01M3 9h.01M3 13h.01" />
          </svg>
          <span>Contests</span>
        </NavLink>
        <NavLink to="/user">
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path d="M8 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3 13a5 5 0 0 1 10 0" />
          </svg>
          <span>User Stats</span>
        </NavLink>
        <DropdownMenu.Root modal={false}>
          <DropdownMenu.Trigger
            className="site-info-trigger"
            aria-current={isAbout || isChangelog ? "location" : undefined}
          >
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <path d="M8 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM8 7.5v3M8 5h.01" />
            </svg>
            <span>
              Info
              <svg
                className="site-info-chevron"
                viewBox="0 0 16 16"
                width="14"
                height="14"
                aria-hidden="true"
              >
                <path d="m4 6 4 4 4-4" />
              </svg>
            </span>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="site-info-menu"
              align="end"
              sideOffset={8}
              collisionPadding={8}
            >
              <DropdownMenu.Item asChild>
                <NavLink to="/about">
                  <svg
                    viewBox="0 0 16 16"
                    width="16"
                    height="16"
                    aria-hidden="true"
                  >
                    <path d="M8 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM8 7.5v3M8 5h.01" />
                  </svg>
                  About
                </NavLink>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <NavLink to="/changelog">
                  <svg
                    viewBox="0 0 16 16"
                    width="16"
                    height="16"
                    aria-hidden="true"
                  >
                    <path d="M3 5a6 6 0 1 1-.5 5M3 2v3h3M8 5v3l2 1" />
                  </svg>
                  Changelog
                </NavLink>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </nav>
      <ThemeToggler />
    </>
  );
};

export default Header;
