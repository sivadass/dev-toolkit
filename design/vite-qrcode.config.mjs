import path from "node:path";
import { fileURLToPath } from "node:url";

const designRoot = path.dirname(fileURLToPath(import.meta.url));

export default {
  build: {
    emptyOutDir: false,
    lib: {
      entry: path.resolve(designRoot, "../app/node_modules/qrcode/lib/browser.js"),
      name: "QRCode",
      formats: ["iife"],
      fileName: () => "qrcode.min.js",
    },
    outDir: path.resolve(designRoot, "assets/vendor"),
    rollupOptions: {
      output: {
        exports: "default",
        extend: false,
        footer: "if (typeof QRCode !== 'undefined' && QRCode && QRCode.default) { QRCode = QRCode.default; }",
      },
    },
  },
};
