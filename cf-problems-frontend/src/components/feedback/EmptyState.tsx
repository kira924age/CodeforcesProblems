import "./Feedback.css";

// Simple empty illustration adapted from Ant Design (MIT).
// Its copyright and license are retained in public/licenses/ant-design-empty-image.txt.
const EmptyState = () => (
  <div className="feedback-empty">
    <div className="feedback-empty-image">
      <svg
        width="64"
        height="41"
        viewBox="0 0 64 41"
        aria-hidden="true"
        focusable="false"
      >
        <g transform="translate(0 1)" fill="none" fillRule="evenodd">
          <ellipse
            className="feedback-empty-shadow"
            cx="32"
            cy="33"
            rx="32"
            ry="7"
          />
          <g className="feedback-empty-outline" fillRule="nonzero">
            <path d="M55 12.8 44.9 1.3Q44 0 42.9 0H21.1q-1.2 0-2 1.3L9 12.8V22h46z" />
            <path
              className="feedback-empty-content"
              d="M41.6 16c0-1.7 1-3 2.2-3H55v18.1c0 2.2-1.3 3.9-3 3.9H12c-1.7 0-3-1.7-3-3.9V13h11.2c1.2 0 2.2 1.3 2.2 3s1 2.9 2.2 2.9h14.8c1.2 0 2.2-1.4 2.2-3"
            />
          </g>
        </g>
      </svg>
    </div>
    <div className="feedback-empty-description">No data</div>
  </div>
);
export default EmptyState;
