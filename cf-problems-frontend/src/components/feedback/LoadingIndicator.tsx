import "./Feedback.css";

const LoadingIndicator = () => (
  <span
    className="feedback-loading"
    role="status"
    aria-label="Loading"
    aria-live="polite"
    aria-busy="true"
  >
    <span className="feedback-loading-dots" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </span>
  </span>
);
export default LoadingIndicator;
