import React from "react";
import Header from "../../components/Header/Header";

import TableTab from "./TableTab";

type Props = {
  userId: string;
};

const TablePage: React.FunctionComponent<Props> = (props: Props) => {
  return (
    <React.Fragment>
      <Header userId={props.userId} location="table" />
      <div className="Main">
        <TableTab userId={props.userId} />
      </div>
    </React.Fragment>
  );
};

export default TablePage;
