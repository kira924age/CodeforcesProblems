import React from "react";
import ErrorAlert from "../../components/feedback/ErrorAlert";

const ErrorMessage: React.FunctionComponent = () => {
  return (
    <ErrorAlert>
      Failure to fetch submissions data. Codeforces is down now or you may
      mistyped.
    </ErrorAlert>
  );
};

export default ErrorMessage;
