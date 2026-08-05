export type ToolStatus = "ready" | "coming-soon";

export interface ToolDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  status: ToolStatus;
}

export const TOOLS: ToolDefinition[] = [
  {
    id: "image-compressor",
    title: "Image compressor",
    description: "Shrink PNG & JPG locally",
    icon: "image",
    path: "/tools/image-compressor",
    status: "ready",
  },
  {
    id: "qr-code-generator",
    title: "QR Code generator",
    description: "Create downloadable QR codes",
    icon: "qr_code_2",
    path: "/tools/qr-code-generator",
    status: "ready",
  },
  {
    id: "json-comparer",
    title: "JSON comparer",
    description: "Diff two JSON payloads",
    icon: "data_object",
    path: "/tools/json-comparer",
    status: "coming-soon",
  },
  {
    id: "text-comparer",
    title: "Text comparer",
    description: "Side-by-side text diff",
    icon: "compare_arrows",
    path: "/tools/text-comparer",
    status: "coming-soon",
  },
  {
    id: "base64",
    title: "Base64",
    description: "Encode and decode strings",
    icon: "code",
    path: "/tools/base64",
    status: "coming-soon",
  },
];

export function getToolById(id: string): ToolDefinition | undefined {
  return TOOLS.find((tool) => tool.id === id);
}

export function getToolMenuItems() {
  return TOOLS.map((tool) => ({
    label: tool.title,
    value: tool.path,
    icon: tool.icon,
  }));
}
