import React from "react";
import { HashRouter, Route, Navigate, Routes, useLocation } from "react-router";

import Header from "./components/Header/Header";
import ThemeProvider from "./components/ThemeProvider";
import TablePage from "./pages/TablePage/index";
import User from "./pages/UserPage/index";
import { AboutPage, ChangelogPage } from "./pages/SiteInfo";

const SiteLayout = () => {
  const { pathname } = useLocation();
  // Preserve the legacy raw hash paths, including empty handles and suffixes.
  const match = pathname.match(/^\/(?:table|user)\/([a-zA-Z0-9_.-]*)(?:\/|$)/i);
  const userId = match?.[1];
  const [lastHandle, setLastHandle] = React.useState(userId ?? "");
  const main = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (userId !== undefined) setLastHandle(userId);
  }, [userId]);

  React.useLayoutEffect(() => {
    if (main.current) main.current.scrollTop = 0;
    if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const fallback = <Navigate to="/table/" replace />;
  return (
    <div className="App">
      <Header userId={userId ?? lastHandle} />
      <main className="Main" ref={main}>
        <Routes>
          <Route
            path="/table/*"
            element={
              userId === undefined ? fallback : <TablePage userId={userId} />
            }
          />
          <Route
            path="/user/*"
            element={userId === undefined ? fallback : <User userId={userId} />}
          />
          <Route path="/changelog" element={<ChangelogPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={fallback} />
        </Routes>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <SiteLayout />
      </HashRouter>
    </ThemeProvider>
  );
}
