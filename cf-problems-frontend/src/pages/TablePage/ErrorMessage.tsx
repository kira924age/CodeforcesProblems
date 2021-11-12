import React from "react";
import { Alert } from "antd";

const ErrorMessage: React.FunctionComponent = (props) => {
  return (
    <Alert
      message="Failure to fetch submissions data. Codeforces is down now or you may mistyped."
      type="error"
    />
  );
};

export default ErrorMessage;
