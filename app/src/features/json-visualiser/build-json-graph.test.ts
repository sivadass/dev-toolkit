import { describe, expect, it } from "vitest";
import { buildJsonGraph, getJsonValueType } from "./build-json-graph";

describe("getJsonValueType", () => {
  it("maps JSON values to short type labels", () => {
    expect(getJsonValueType("hi")).toBe("STR");
    expect(getJsonValueType(52)).toBe("INT");
    expect(getJsonValueType(3.14)).toBe("FLOAT");
    expect(getJsonValueType(true)).toBe("BOOL");
    expect(getJsonValueType(null)).toBe("NULL");
    expect(getJsonValueType({ a: 1 })).toBe("OBJ");
    expect(getJsonValueType([1])).toBe("ARR");
  });
});

describe("buildJsonGraph", () => {
  it("builds a single node for a flat object of primitives", () => {
    const { nodes, edges } = buildJsonGraph({ name: "Apple", calories: 52 });

    expect(nodes.length).toBe(1);
    expect(edges.length).toBe(0);
    expect(nodes[0].data.rows).toEqual(
      expect.arrayContaining([
        { key: "name", value: "Apple", type: "STR" },
        { key: "calories", value: "52", type: "INT" },
      ])
    );
  });

  it("branches nested objects into child nodes with source handles", () => {
    const { nodes, edges } = buildJsonGraph({
      name: "Apple",
      details: { type: "pome", season: "fall" },
    });

    expect(nodes.length).toBe(2);
    expect(edges.length).toBe(1);
    expect(edges[0].sourceHandle).toBe("details");
    expect(edges[0].label).toBeUndefined();
    expect(nodes[0].data.rows).toEqual(
      expect.arrayContaining([
        { key: "name", value: "Apple", type: "STR" },
        {
          key: "details",
          value: "{2 keys}",
          type: "OBJ",
          childHandleId: "details",
        },
      ])
    );

    const child = nodes.find((node) => node.id !== nodes[0].id);
    expect(child?.data.rows).toEqual(
      expect.arrayContaining([
        { key: "type", value: "pome", type: "STR" },
        { key: "season", value: "fall", type: "STR" },
      ])
    );
  });

  it("represents arrays with one child per element", () => {
    const { nodes, edges } = buildJsonGraph({ fruits: ["a", "b"] });

    expect(nodes.length).toBeGreaterThanOrEqual(2);
    expect(edges.some((edge) => edge.sourceHandle === "fruits")).toBe(true);
    expect(nodes[0].data.rows).toEqual(
      expect.arrayContaining([
        {
          key: "fruits",
          value: "[2 items]",
          type: "ARR",
          childHandleId: "fruits",
        },
      ])
    );

    const fruitsNode = nodes.find((node) =>
      node.data.rows.some((row) => row.childHandleId === "0")
    );
    expect(fruitsNode?.data.rows).toEqual(
      expect.arrayContaining([
        {
          key: "0",
          value: "a",
          type: "STR",
          childHandleId: "0",
        },
        {
          key: "1",
          value: "b",
          type: "STR",
          childHandleId: "1",
        },
      ])
    );
  });

  it("attaches source handles only to rows that branch to children", () => {
    const { nodes, edges } = buildJsonGraph({
      name: "Apple",
      meta: { color: "red" },
      tags: ["fresh"],
    });

    const root = nodes[0];
    const branching = root.data.rows.filter((row) => row.childHandleId);
    expect(branching.map((row) => row.key).sort()).toEqual(["meta", "tags"]);
    expect(edges.every((edge) => typeof edge.sourceHandle === "string")).toBe(true);
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
