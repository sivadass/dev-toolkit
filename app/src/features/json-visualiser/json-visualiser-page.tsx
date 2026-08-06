import { Button, FormControls, Icon, PageHeader, Typography } from "cleanplate";
import { JsonGraphPane } from "./json-graph-pane";
import { JsonTreePane } from "./json-tree-pane";
import { useJsonVisualiser } from "./use-json-visualiser";

export function JsonVisualiserPage() {
  const {
    jsonText,
    setJsonText,
    leftMode,
    setLeftMode,
    isValid,
    parseError,
    parsedValue,
    nodes,
    edges,
  } = useJsonVisualiser();

  return (
    <div className="json-visualiser">
      <PageHeader
        title="JSON visualiser"
        subtitle="Inspect JSON as an expandable tree or interactive graph - all in your browser."
      />

      <div className="json-visualiser__workspace">
        <section className="json-visualiser__left" aria-label="JSON input">
          <div className="json-visualiser__toolbar">
            <Button
              variant={leftMode === "text" ? "solid" : "outline"}
              size="small"
              onClick={() => setLeftMode("text")}
            >
              Text
            </Button>
            <Button
              variant={leftMode === "tree" ? "solid" : "outline"}
              size="small"
              onClick={() => setLeftMode("tree")}
            >
              Tree
            </Button>
          </div>

          {leftMode === "text" ? (
            <div className="json-visualiser__editor">
              <FormControls.TextArea
                label="JSON input"
                value={jsonText}
                onChange={(event) => setJsonText(event.target.value)}
                isFluid
                rows={20}
              />
            </div>
          ) : (
            <JsonTreePane value={parsedValue} />
          )}
        </section>

        <section className="json-visualiser__right" aria-label="JSON graph">
          <JsonGraphPane nodes={nodes} edges={edges} />
        </section>
      </div>

      <div
        className={
          isValid
            ? "json-visualiser__status json-visualiser__status--valid"
            : "json-visualiser__status json-visualiser__status--invalid"
        }
        role="status"
      >
        <Icon name={isValid ? "check_circle" : "error"} size="small" aria-hidden />
        <Typography variant="small" margin="0">
          {isValid ? "Valid" : `Invalid${parseError ? `: ${parseError}` : ""}`}
        </Typography>
      </div>
    </div>
  );
}
