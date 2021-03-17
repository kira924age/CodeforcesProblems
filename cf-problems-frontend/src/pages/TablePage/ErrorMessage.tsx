import React from "react";
import { Alert } from "antd";

const ErrorMessage: React.FunctionComponent = (props) => {
  return <Alert message="An error occurred. Codeforces is probably down now." type="error" />;
};

export default ErrorMessage;
