import React from "react";
import { HashRouter, Route, Navigate, Routes, useLocation } from "react-router";

import ThemeProvider from "./components/ThemeProvider";
import TablePage from "./pages/TablePage/index";
import User from "./pages/UserPage/index";

const HandleRoute = ({ page }: { page: "table" | "user" }) => {
  const { pathname } = useLocation();
  // Router 6 no longer supports regex parameters. Match the original raw path
  // before decoding to retain v5's handle rules, empty handle and prefix match.
  const match = pathname.match(/^\/(?:table|user)\/([a-zA-Z0-9_.-]*)(?:\/|$)/i);
  if (!match) return <Navigate to="/table/" replace />;
  const userId = match[1];
  return page === "table" ? (
    <TablePage userId={userId} />
  ) : (
    <User userId={userId} />
  );
};

const App: React.FunctionComponent = () => (
  <ThemeProvider>
    <HashRouter>
      <div className="App">
        <Routes>
          <Route path="/table/*" element={<HandleRoute page="table" />} />
          <Route path="/user/*" element={<HandleRoute page="user" />} />
          <Route path="*" element={<Navigate to="/table/" replace />} />
        </Routes>
      </div>
    </HashRouter>
  </ThemeProvider>
);

export default App;
