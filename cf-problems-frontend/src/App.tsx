import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import TablePage from "./pages/TablePage/index";
import User from "./pages/UserPage/index";

const router = createBrowserRouter([
  { path: "/", element: <TablePage /> },
  { path: "/table", element: <TablePage /> },
  { path: "table/:userId", element: <TablePage /> },
  { path: "user/:userId", element: <User /> },
]);

const App: React.FunctionComponent = () => (
  <div className="App">
    <RouterProvider router={router} />
  </div>
);

export default App;
