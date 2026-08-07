import {
  Alert,
  Button,
  Container,
  FormControls,
  Typography,
} from "cleanplate";
import { ToolPageHeader } from "../../components/tool-page-header";
import type { DiffType, JsonDiffEntry } from "./compare-json";
import { useJsonComparer } from "./use-json-comparer";

function diffLabel(type: DiffType): string {
  if (type === "added") return "Added";
  if (type === "removed") return "Removed";
  return "Changed";
}

function formatValue(value: unknown): string {
  return JSON.stringify(value);
}

function DiffRow({ entry }: { entry: JsonDiffEntry }) {
  return (
    <li className={`json-diff-item json-diff-item--${entry.type}`}>
      <span className="json-diff-item__badge">{diffLabel(entry.type)}</span>
      <code className="json-diff-item__path">{entry.path}</code>
      <span className="json-diff-item__values">
        {entry.type === "added" ? (
          formatValue(entry.right)
        ) : entry.type === "removed" ? (
          formatValue(entry.left)
        ) : (
          <>
            {formatValue(entry.left)}
            <span className="json-diff-item__arrow" aria-hidden>
              →
            </span>
            {formatValue(entry.right)}
          </>
        )}
      </span>
    </li>
  );
}

export function JsonComparerPage() {
  const {
    left,
    setLeft,
    right,
    setRight,
    result,
    error,
    copyFeedback,
    canCompare,
    compare,
    formatLeft,
    formatRight,
    swap,
    copyResult,
    identicalMessage,
  } = useJsonComparer();

  return (
    <>
      <ToolPageHeader
        kicker="Client-side · Private"
        title="JSON comparer"
        subtitle="Paste left & right — diffs stay on-device."
        primaryCta={
          <Button
            variant="solid"
            isDisabled={!canCompare}
            onClick={() => compare()}
          >
            Compare
          </Button>
        }
      />

      {error ? <Alert message={error} variant="error" margin="t-4" /> : null}

      <div className="json-split-panes">
        <div>
          <FormControls.TextArea
            label="Left JSON"
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            placeholder='{"hello": "world"}'
            isFluid
            margin={["t-4", "b-2"]}
            dataTestId="json-left"
          />
          <div className="json-pane-actions">
            <Button variant="outline" onClick={() => formatLeft()}>
              Format
            </Button>
          </div>
        </div>
        <div>
          <FormControls.TextArea
            label="Right JSON"
            value={right}
            onChange={(e) => setRight(e.target.value)}
            placeholder='{"hello": "devtoolkit"}'
            isFluid
            margin={["t-4", "b-2"]}
            dataTestId="json-right"
          />
          <div className="json-pane-actions">
            <Button variant="outline" onClick={() => formatRight()}>
              Format
            </Button>
          </div>
        </div>
      </div>

      <div className="json-pane-actions json-pane-actions--spaced">
        <Button variant="outline" onClick={() => swap()}>
          Swap
        </Button>
      </div>

      <Container
        display="block"
        margin="t-6"
        padding="0"
        aria-live="polite"
      >
        <Container showBorder padding="4" margin="0" className="json-result">
          <Typography variant="h4" margin="0">
            Result
          </Typography>

          {!result ? (
            <Typography variant="small" margin="t-2">
              Comparison output will appear here.
            </Typography>
          ) : result.diffs.length === 0 ? (
            <>
              <Typography variant="small" margin="t-2">
                {identicalMessage}
              </Typography>
              <div className="json-pane-actions json-pane-actions--tight">
                <Button variant="outline" onClick={() => void copyResult()}>
                  {copyFeedback ?? "Copy result"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Typography variant="small" margin="t-2">
                {result.summary.added} added · {result.summary.removed} removed ·{" "}
                {result.summary.changed} changed
              </Typography>
              <ul className="json-diff-list">
                {result.diffs.map((entry) => (
                  <DiffRow key={`${entry.type}:${entry.path}`} entry={entry} />
                ))}
              </ul>
              <div className="json-pane-actions json-pane-actions--tight">
                <Button variant="outline" onClick={() => void copyResult()}>
                  {copyFeedback ?? "Copy result"}
                </Button>
              </div>
            </>
          )}
        </Container>
      </Container>
    </>
  );
}
