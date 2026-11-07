import React from "react";
import { Alert } from "antd";

const UserNotFound: React.FunctionComponent = (props) => {
  return <Alert title="User not found!" type="error" />;
};

export default UserNotFound;
