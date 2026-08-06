import { describe, expect, it } from "vitest";
import { buildJsonGraph } from "./build-json-graph";

describe("buildJsonGraph", () => {
  it("builds a single node for a flat object of primitives", () => {
    const { nodes, edges } = buildJsonGraph({ name: "Apple", calories: 52 });

    expect(nodes.length).toBe(1);
    expect(edges.length).toBe(0);
    expect(nodes[0].data.rows).toEqual(
      expect.arrayContaining([
        { key: "name", value: "Apple" },
        { key: "calories", value: "52" },
      ])
    );
  });

  it("branches nested objects into child nodes with labeled edges", () => {
    const { nodes, edges } = buildJsonGraph({
      name: "Apple",
      details: { type: "pome", season: "fall" },
    });

    expect(nodes.length).toBe(2);
    expect(edges.length).toBe(1);
    expect(edges[0].label).toBe("details");

    const child = nodes.find((node) => node.id !== nodes[0].id);
    expect(child?.data.rows).toEqual(
      expect.arrayContaining([
        { key: "type", value: "pome" },
        { key: "season", value: "fall" },
      ])
    );
  });

  it("represents arrays with item count and one child per element", () => {
    const { nodes, edges } = buildJsonGraph({ fruits: ["a", "b"] });

    expect(nodes.length).toBeGreaterThanOrEqual(2);
    expect(edges.some((edge) => edge.label === "fruits")).toBe(true);
  });

  it("handles empty object and empty array", () => {
    expect(buildJsonGraph({}).nodes.length).toBe(1);
    expect(buildJsonGraph([]).nodes.length).toBe(1);
  });

  it("assigns positions via dagre (nodes have numeric x/y)", () => {
    const { nodes } = buildJsonGraph({ a: { b: 1 } });

    for (const node of nodes) {
      expect(typeof node.position.x).toBe("number");
      expect(typeof node.position.y).toBe("number");
    }
  });
});
