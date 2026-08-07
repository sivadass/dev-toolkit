import {
  Alert,
  Button,
  Container,
  FormControls,
  Typography,
} from "cleanplate";
import { ToolPageHeader } from "../../components/tool-page-header";
import { ToolSurface } from "../../components/tool-surface";
import { TextDiffView } from "./text-diff-view";
import { useTextComparer } from "./use-text-comparer";

export function TextComparerPage() {
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
    swap,
    clear,
    copyResult,
    identicalMessage,
  } = useTextComparer();

  return (
    <>
      <ToolPageHeader
        kicker="Client-side · Private"
        title="Text comparer"
        subtitle="Compare two text blocks side by side."
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

      <div className="text-split-panes">
        <FormControls.TextArea
          label="Left"
          value={left}
          onChange={(e) => setLeft(e.target.value)}
          placeholder="Paste original text"
          isFluid
          margin="t-4"
          dataTestId="text-left"
        />
        <FormControls.TextArea
          label="Right"
          value={right}
          onChange={(e) => setRight(e.target.value)}
          placeholder="Paste changed text"
          isFluid
          margin="t-4"
          dataTestId="text-right"
        />
      </div>

      <div className="text-pane-actions text-pane-actions--spaced">
        <Button variant="outline" onClick={() => swap()}>
          Swap
        </Button>
        <Button variant="outline" onClick={() => clear()}>
          Clear
        </Button>
      </div>

      <Container display="block" margin="t-6" padding="0" aria-live="polite">
        <ToolSurface className="text-result">
          <Typography variant="h4" margin="0">
            Diff
          </Typography>

          {!result ? (
            <Typography variant="small" margin="t-2">
              Diff output will appear here.
            </Typography>
          ) : result.identical ? (
            <>
              <Typography variant="small" margin="t-2">
                {identicalMessage}
              </Typography>
              <div className="text-pane-actions text-pane-actions--tight">
                <Button variant="outline" onClick={() => void copyResult()}>
                  {copyFeedback ?? "Copy unified diff"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <TextDiffView rows={result.rows} />
              <div className="text-pane-actions text-pane-actions--tight">
                <Button variant="outline" onClick={() => void copyResult()}>
                  {copyFeedback ?? "Copy unified diff"}
                </Button>
              </div>
            </>
          )}
        </ToolSurface>
      </Container>
    </>
  );
}
