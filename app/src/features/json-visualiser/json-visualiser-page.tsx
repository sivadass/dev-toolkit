import { FormControls, Icon, Typography } from "cleanplate";
import { ToolPageHeader } from "../../components/tool-page-header";
import { JsonGraphPane } from "./json-graph-pane";
import { JsonTreePane } from "./json-tree-pane";
import { useJsonVisualiser } from "./use-json-visualiser";

const LEFT_MODE_OPTIONS = [
  { label: "Text", value: "text" },
  { label: "Tree", value: "tree" },
] as const;

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
      <ToolPageHeader
        kicker="Client-side · Private"
        title="JSON visualiser"
        subtitle="Inspect JSON as an expandable tree or interactive graph - all in your browser."
      />

      <div className="json-visualiser__workspace">
        <section className="json-visualiser__left" aria-label="JSON input">
          <div className="json-visualiser__toolbar">
            <FormControls.SegmentedControl
              label="Editor view"
              name="json-visualiser-left-mode"
              size="small"
              value={leftMode}
              onChange={(value) => setLeftMode(String(value) as "text" | "tree")}
              margin="0"
              options={[...LEFT_MODE_OPTIONS]}
            />
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

          <div className="json-visualiser__pane-body">
            {leftMode === "text" ? (
              <div className="json-visualiser__editor">
                <FormControls.TextArea
                  label="JSON input"
                  value={jsonText}
                  onChange={(event) => setJsonText(event.target.value)}
                  isFluid
                />
              </div>
            ) : (
              <div className="json-visualiser__tree-slot">
                <JsonTreePane value={parsedValue} />
              </div>
            )}
          </div>
        </section>

        <section className="json-visualiser__right" aria-label="JSON graph">
          <JsonGraphPane nodes={nodes} edges={edges} />
        </section>
      </div>
    </div>
  );
}
