import React from "react";
import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router";

import Header from "./components/Header/Header";
import ThemeProvider from "./components/ThemeProvider";
import TablePage from "./pages/TablePage/index";
import User from "./pages/UserPage/index";
import { AboutPage, ChangelogPage } from "./pages/SiteInfo";

const SiteLayout = () => {
  const { pathname } = useLocation();
  const [userId, setUserId] = React.useState(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem("userId") ?? '""');
      return typeof saved === "string" && /^[a-zA-Z0-9_.-]*$/.test(saved)
        ? saved
        : "";
    } catch {
      return "";
    }
  });
  const main = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    try {
      localStorage.setItem("userId", JSON.stringify(userId));
    } catch {
      // Keep the applied handle usable for this visit if storage is unavailable.
    }
  }, [userId]);

  React.useLayoutEffect(() => {
    if (main.current) main.current.scrollTop = 0;
    if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  return (
    <div className="App">
      <Header />
      <main className="Main" ref={main}>
        <Routes>
          <Route
            path="/"
            element={<TablePage userId={userId} onUserIdChange={setUserId} />}
          />
          <Route
            path="/user"
            element={<User userId={userId} onUserIdChange={setUserId} />}
          />
          <Route path="/changelog" element={<ChangelogPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route
            path="*"
            element={
              <>
                <h1>Page not found</h1>
                <Link to="/">Go to Contests</Link>
              </>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <SiteLayout />
      </BrowserRouter>
    </ThemeProvider>
  );
}
