import "./SiteInfo.css";

const repository = "https://github.com/kira924age/CodeforcesProblems";

const changes = [
  {
    date: "2026-11-10",
    title: "Easier contest browsing and clearer stats",
    description:
      "Contest tables hide empty problem columns and let you choose the page size in every category. Category tabs are easier to scan on narrow screens and in dark mode. Contests and User Stats now have an integrated search button, rounded tables, and clearer date and number formatting.",
    pr: 137,
  },
  {
    date: "2026-11-10",
    title: "New navigation and submission refresh",
    description:
      "Use the top navigation on desktop or the bottom bar on narrow screens. Open Info for About and Changelog, and use Refresh in Contests or User Stats to update your submission data in both views.",
    pr: 136,
  },
  {
    date: "2026-11-08",
    title: "Lightweight Climbing chart",
    description: "The cumulative solved-problems chart now uses Chart.js.",
    pr: 128,
  },
  {
    date: "2026-11-08",
    title: "Smaller UI bundle",
    description: "Removed Ant Design while preserving light and dark themes.",
    pr: 126,
  },
  {
    date: "2026-11-08",
    title: "Improved pagination",
    description:
      "Contest and submission tables have mobile-friendly pagination and a page size selector.",
    pr: 122,
  },
];

export function ChangelogPage() {
  return (
    <article className="site-info">
      <header className="info-heading">
        <h1>Changelog</h1>
        <p>
          Updates to make exploring problems and tracking progress a little
          better.
        </p>
      </header>
      <div className="changelog-list">
        {changes.map(({ date, title, description, pr }) => (
          <section className="changelog-entry" key={pr}>
            <time dateTime={date}>{date}</time>
            <div className="changelog-content">
              <h2>{title}</h2>
              <p>{description}</p>
              <a href={`${repository}/pull/${pr}`}>
                View update <span aria-hidden="true">↗</span>
              </a>
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}

export function AboutPage() {
  return (
    <article className="site-info">
      <header className="info-heading about-heading">
        <h1>About</h1>
        <p>
          A clearer view of your practice. Explore problems, follow your
          progress, and build a habit of solving.
        </p>
      </header>
      <section className="about-features" aria-label="How to use">
        <div className="about-feature">
          <h2>Find your next problem</h2>
          <p>
            Browse Contests by category. Enter your Codeforces handle to see
            which problems you have already solved.
          </p>
        </div>
        <div className="about-feature">
          <h2>See your progress</h2>
          <p>
            Open User Stats to explore your submission history, daily activity,
            and cumulative solving progress.
          </p>
        </div>
      </section>
      <section className="about-detail">
        <h2>Powered by Codeforces</h2>
        <p>
          Contest and submission data come from the{" "}
          <a href="https://codeforces.com/apiHelp">Codeforces API</a>. The
          contest list is updated daily. Use Refresh to fetch your latest
          activity.
        </p>
      </section>
      <section className="about-detail">
        <h2>Help make it better</h2>
        <p>
          Found a bug or have an idea? Share your feedback or explore the
          project on GitHub.
        </p>
        <div className="info-links">
          <a href={repository}>
            Source code <span aria-hidden="true">↗</span>
          </a>
          <a href={`${repository}/issues`}>
            Send feedback <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>
    </article>
  );
}
