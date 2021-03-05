import React from "react";
import Header from "../../components/Header/Header";

import TableTabButtons from "./TableTab";

interface Props {
  userId: string | undefined;
}

const TablePage: React.FunctionComponent<Props> = (props: Props) => {
  return (
    <>
      <Header userId={props.userId} location="table" />
      <div className="Main">
        <TableTabButtons userId={props.userId} />
      </div>
    </>
  );
};

export default TablePage;
