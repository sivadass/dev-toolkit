import { Icon, Typography } from "cleanplate";
import { Link } from "react-router-dom";
import { TOOLS } from "../config/tools";

export function HomePage() {
  return (
    <>
      <Typography variant="small" margin="0">
        Client-side · Private
      </Typography>
      <Typography variant="h1" margin="t-2">
        Tools that stay in your browser
      </Typography>
      <Typography variant="p" margin="t-2">
        Compress, compare, encode — free utilities that never upload your data.
      </Typography>
      <div className="tool-grid">
        {TOOLS.map((tool) => (
          <Link key={tool.id} to={tool.path} className="tool-card-link">
            <Icon name={tool.icon as never} aria-hidden />
            <Typography variant="h4" margin="t-2">
              {tool.title}
            </Typography>
            <Typography variant="small" margin="t-1">
              {tool.description}
            </Typography>
          </Link>
        ))}
      </div>
    </>
  );
}
