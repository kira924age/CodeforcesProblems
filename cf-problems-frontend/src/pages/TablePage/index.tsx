import React from "react";
import Header from "../../components/Header/Header";
import { useParams } from "react-router-dom";
import TableTab from "./TableTab";

const TablePage: React.FunctionComponent = () => {
  const params = useParams();
  const userId: string = params.userId ?? "";

  return (
    <React.Fragment>
      <Header userId={userId} location="table" />
      <div className="Main">
        <TableTab userId={userId} />
      </div>
    </React.Fragment>
  );
};

export default TablePage;
