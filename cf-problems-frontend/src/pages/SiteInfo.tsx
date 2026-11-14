import { Link } from "react-router";
import "./SiteInfo.css";

const repository = "https://github.com/kira924age/CodeforcesProblems";

const changes = [
  {
    date: "2026-11-14",
    title: "Cleaner URLs and a saved Codeforces ID",
    description:
      "Pages now use standard URLs, with Contests at the site root. Your applied Codeforces ID is remembered across page changes and reloads.",
    category: "Navigation",
    pr: 141,
  },
  {
    date: "2026-11-14",
    title: "Hosting moved to Cloudflare Workers",
    description:
      "Moved site hosting from GitHub Pages to Cloudflare Workers Static Assets.",
    category: "Hosting",
    pr: 139,
  },
  {
    date: "2026-11-10",
    title: "Easier contest browsing and clearer stats",
    description:
      "Empty problem columns stay out of the way. Choose a page size in every contest category, with clearer tabs, rounded tables, and easier-to-read dates and numbers.",
    category: "Interface",
    pr: 137,
  },
  {
    date: "2026-11-10",
    title: "New navigation and submission refresh",
    description:
      "Find navigation at the top on desktop and below the content on mobile. Open Info for About and Changelog, and refresh your activity from Contests or User Stats.",
    category: "Navigation",
    pr: 136,
  },
  {
    date: "2026-11-08",
    title: "Lightweight Climbing chart",
    description: "The cumulative solved-problems chart now uses Chart.js.",
    category: "Charts",
    pr: 128,
  },
  {
    date: "2026-11-08",
    title: "Smaller UI bundle",
    description: "Removed Ant Design while preserving light and dark themes.",
    category: "Performance",
    pr: 126,
  },
  {
    date: "2026-11-08",
    title: "Improved pagination",
    description:
      "Contest and submission tables have mobile-friendly pagination and a page size selector.",
    category: "Interface",
    pr: 122,
  },
];

const releases = [...new Set(changes.map(({ date }) => date))].map((date) => ({
  date,
  entries: changes.filter((change) => change.date === date),
}));
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export function ChangelogPage() {
  return (
    <article className="site-info changelog-page">
      <header className="info-heading">
        <h1>Changelog</h1>
        <p>
          Small improvements for your next solve.
          <br />
          See what’s changed across the site.
        </p>
      </header>
      <div className="release-groups">
        {releases.map(({ date, entries }) => (
          <section
            className="release-group"
            key={date}
            aria-label={dateFormatter.format(new Date(date))}
          >
            <div className="release-date">
              <time dateTime={date}>
                {dateFormatter.format(new Date(date))}
              </time>
            </div>
            <div className="release-list">
              {entries.map(({ category, title, description, pr }) => (
                <section className="release-entry" key={pr}>
                  <div className="release-meta">
                    <span className="change-type">{category}</span>
                    <a
                      href={`${repository}/pull/${pr}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View update <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                  <h2>{title}</h2>
                  <p>{description}</p>
                </section>
              ))}
            </div>
          </section>
        ))}
      </div>
      <footer className="changelog-bottom">
        <span>Have an idea for the next update?</span>
        <a
          href={`${repository}/issues`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Share feedback <span aria-hidden="true">↗</span>
        </a>
      </footer>
    </article>
  );
}

export function AboutPage() {
  return (
    <article className="site-info about-page">
      <header className="info-heading">
        <h1>About</h1>
      </header>
      <div className="about-reading">
        <p>
          Codeforces Problems is a web application for browsing Codeforces
          contest problems and tracking your solving progress. It brings a
          contest-based problem table, submission history, activity charts, and
          first-solve statistics into one place.
        </p>
        <p>
          Browse the problem list in <Link to="/">Contests</Link>, or enter a
          Codeforces ID and open <Link to="/user">User Stats</Link> to review
          solving progress. Your applied ID, theme, and contest-view preferences
          are remembered in this browser.
        </p>
        <p>
          The contest archive is based on Codeforces data. Profiles and
          submission history are retrieved through the{" "}
          <a
            href="https://codeforces.com/apiHelp"
            target="_blank"
            rel="noopener noreferrer"
          >
            Codeforces API
          </a>
          .
        </p>
        <p>
          The project is{" "}
          <a href={repository} target="_blank" rel="noopener noreferrer">
            open source on GitHub <span aria-hidden="true">↗</span>
          </a>
          . Bug reports, suggestions, and contributions are welcome through the{" "}
          <a
            href={`${repository}/issues`}
            target="_blank"
            rel="noopener noreferrer"
          >
            issue tracker <span aria-hidden="true">↗</span>
          </a>
          .
        </p>
      </div>
    </article>
  );
}
