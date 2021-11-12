import React from "react";
import { HashRouter, Route, Redirect, Switch } from "react-router-dom";

import ThemeProvider from "./components/ThemeProvider";
import TablePage from "./pages/TablePage/index";
import User from "./pages/UserPage/index";

const App: React.FunctionComponent = () => (
  <ThemeProvider>
    <HashRouter>
      <div className="App">
        <Switch>
          <Route
            path="/table/:userIds([a-zA-Z0-9_.]+)+"
            render={({ match }): React.ReactElement => {
              // @ts-ignore
              const params: { userIds?: string } = match.params;
              const userId = params.userIds === undefined ? "" : params.userIds;
              return <TablePage userId={userId} />;
            }}
          />
          <Route
            path="/user/:userIds([a-zA-Z0-9_.]*)*"
            render={({ match }): React.ReactElement => {
              // @ts-ignore
              const params: { userIds?: string } = match.params;
              const userId = params.userIds === undefined ? "" : params.userIds;
              return <User userId={userId} />;
            }}
          />

          {/*Default Path*/}
          <Redirect path="/" to="/table/" />
        </Switch>
      </div>
    </HashRouter>
  </ThemeProvider>
);

export default App;
