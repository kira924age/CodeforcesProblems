import type { ReactNode } from "react";
import "./Feedback.css";

const ErrorAlert = ({ children }: { children: ReactNode }) => (
  <div className="feedback-alert" role="alert">
    <div className="feedback-alert-text">{children}</div>
  </div>
);
export default ErrorAlert;
