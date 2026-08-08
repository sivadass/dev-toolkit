import { Typography } from "cleanplate";
import type { ReactNode } from "react";

export type ToolPageHeaderProps = {
  title: string;
  subtitle?: string;
  kicker?: string;
  primaryCta?: ReactNode;
  className?: string;
};

export function ToolPageHeader({
  title,
  subtitle,
  kicker,
  primaryCta,
  className,
}: ToolPageHeaderProps) {
  const rootClass = ["tool-page-header", className].filter(Boolean).join(" ");

  return (
    <header className={rootClass}>
      <div className="tool-page-header__text">
        {kicker ? (
          <Typography variant="small" margin="0" className="tool-page-header__kicker">
            {kicker}
          </Typography>
        ) : null}
        <Typography
          variant="h1"
          margin={kicker ? "t-3" : "0"}
          className="tool-page-header__title"
        >
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="p" margin="t-2" className="tool-page-header__subtitle">
            {subtitle}
          </Typography>
        ) : null}
      </div>
      {primaryCta ? (
        <div className="tool-page-header__cta">{primaryCta}</div>
      ) : null}
    </header>
  );
}
