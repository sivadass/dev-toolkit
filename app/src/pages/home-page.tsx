import { Badge, Icon, Typography } from "cleanplate";
import { Link } from "react-router-dom";
import { TOOLS } from "../config/tools";

export function HomePage() {
  return (
    <div className="home">
      <section aria-labelledby="home-heading">
        <Typography variant="small" margin="0" className="home__kicker">
          Client-side · Private
        </Typography>
        <Typography variant="h1" margin="t-3" id="home-heading">
          Tools that stay in your browser
        </Typography>
        <Typography variant="p" margin="t-3" className="home__lead">
          Compress, compare, encode — free utilities that never upload your
          data.
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
                className={
                  isReady
                    ? "tool-card-link"
                    : "tool-card-link tool-card-link--soon"
                }
              >
                <div className="tool-card-link__top">
                  <span className="tool-card-link__icon" aria-hidden>
                    <Icon name={tool.icon as never} size="large" />
                  </span>
                  <Badge
                    label={isReady ? "Ready" : "Soon"}
                    variant={isReady ? "success" : "default"}
                  />
                </div>
                <Typography variant="h4" margin="t-4">
                  {tool.title}
                </Typography>
                <Typography variant="small" margin="t-2" className="tool-card-link__desc">
                  {tool.description}
                </Typography>
                <span className="tool-card-link__cta">
                  {isReady ? "Open tool" : "Coming soon"}
                  <Icon name="arrow_forward" size="small" aria-hidden />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
