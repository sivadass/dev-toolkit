import type { ReactNode } from "react";

export type ToolSurfaceProps = {
  children: ReactNode;
  className?: string;
};

export function ToolSurface({ children, className }: ToolSurfaceProps) {
  const rootClass = ["tool-surface", className].filter(Boolean).join(" ");
  return <div className={rootClass}>{children}</div>;
}
