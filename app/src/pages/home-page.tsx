import { Icon, Typography } from "cleanplate";
import { Link } from "react-router-dom";
import { TOOLS } from "../config/tools";

export function HomePage() {
  return (
    <div className="home">
      <section aria-labelledby="home-heading">
        <Typography variant="small" margin="0" className="home__kicker">
          Client-side · Private
        </Typography>
        <Typography
          variant="h1"
          margin="t-3"
          id="home-heading"
          className="home__headline"
        >
          Tools that stay in your browser
        </Typography>
        <Typography variant="p" margin="t-3" className="home__lead">
          Compress, compare, encode — never uploaded.
        </Typography>
      </section>

      <section className="home__tools" aria-label="Available tools">
        <div className="tool-grid">
          {TOOLS.map((tool) => {
            const isReady = tool.status === "ready";
            return (
              <Link
                key={tool.id}
                to={tool.path}
                className={isReady ? "tool-tile" : "tool-tile tool-tile--soon"}
              >
                <span className="tool-tile__icon" aria-hidden>
                  <Icon name={tool.icon as never} size="medium" />
                </span>
                <Typography
                  variant="h4"
                  margin="t-3"
                  className="tool-tile__title"
                >
                  {tool.title}
                </Typography>
                <Typography
                  variant="small"
                  margin="t-1"
                  className="tool-tile__desc"
                >
                  {isReady ? tool.description : "Soon"}
                </Typography>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
