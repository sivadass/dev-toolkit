import { JsonView, defaultStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";

type JsonTreePaneProps = {
  value: unknown;
};

function toTreeData(value: unknown): object | unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (value !== null && typeof value === "object") {
    return value as object;
  }

  return { value };
}

export function JsonTreePane({ value }: JsonTreePaneProps) {
  if (value === null || value === undefined) {
    return <p className="json-visualiser__empty">No valid JSON to display.</p>;
  }

  return (
    <div className="json-visualiser__tree" data-testid="json-tree-pane">
      <JsonView data={toTreeData(value)} style={defaultStyles} />
    </div>
  );
}
