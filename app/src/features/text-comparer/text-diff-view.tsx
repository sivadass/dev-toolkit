import type { TextDiffRow, TextSpan } from "./compare-text";

function SpanList({ spans }: { spans: TextSpan[] }) {
  if (spans.length === 0) {
    return <span className="text-diff-view__empty">&nbsp;</span>;
  }

  return (
    <>
      {spans.map((span, index) => (
        <span
          key={`${index}:${span.text.slice(0, 12)}`}
          className={
            span.highlight
              ? `text-diff-view__span text-diff-view__span--${span.highlight}`
              : "text-diff-view__span"
          }
        >
          {span.text}
        </span>
      ))}
    </>
  );
}

function DiffColumn({
  side,
  rows,
}: {
  side: "left" | "right";
  rows: TextDiffRow[];
}) {
  return (
    <div className="text-diff-view__pane" data-testid={`text-diff-${side}`}>
      <div className="text-diff-view__pane-label">
        {side === "left" ? "Left" : "Right"}
      </div>
      <div className="text-diff-view__lines" role="table" aria-label={`${side} diff`}>
        {rows.map((row, index) => {
          const number = side === "left" ? row.leftNumber : row.rightNumber;
          const spans = side === "left" ? row.leftSpans : row.rightSpans;
          const isSpacer = number === null;

          return (
            <div
              key={`${side}-${index}`}
              className={`text-diff-view__row text-diff-view__row--${row.kind}${
                isSpacer ? " text-diff-view__row--spacer" : ""
              }`}
              role="row"
            >
              <span className="text-diff-view__gutter" role="cell">
                {number ?? ""}
              </span>
              <span className="text-diff-view__code" role="cell">
                <SpanList spans={spans} />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TextDiffView({ rows }: { rows: TextDiffRow[] }) {
  return (
    <div className="text-diff-view" data-testid="text-diff-view">
      <DiffColumn side="left" rows={rows} />
      <DiffColumn side="right" rows={rows} />
    </div>
  );
}
