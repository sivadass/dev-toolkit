import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { Base64Page } from "./features/base64/base64-page";
import { ImageCompressorPage } from "./features/image-compressor/image-compressor-page";
import { JsonComparerPage } from "./features/json-comparer/json-comparer-page";
import { JsonVisualiserPage } from "./features/json-visualiser/json-visualiser-page";
import { QrCodeGeneratorPage } from "./features/qr-code-generator/qr-code-generator-page";
import { QrDecoderPage } from "./features/qr-decoder/qr-decoder-page";
import { TextComparerPage } from "./features/text-comparer/text-comparer-page";
import { HomeLayout } from "./layouts/home-layout";
import { ToolLayout } from "./layouts/tool-layout";
import { ComingSoonPage } from "./pages/coming-soon-page";
import { HomePage } from "./pages/home-page";
import { NotFoundPage } from "./pages/not-found-page";

const PdfCompressorPage = lazy(async () => {
  const mod = await import("./features/pdf-compressor/pdf-compressor-page");
  return { default: mod.PdfCompressorPage };
});

export function App() {
  return (
    <Routes>
      <Route element={<HomeLayout />}>
        <Route index element={<HomePage />} />
      </Route>
      <Route path="/tools" element={<ToolLayout />}>
        <Route path="image-compressor" element={<ImageCompressorPage />} />
        <Route
          path="pdf-compressor"
          element={
            <Suspense fallback={null}>
              <PdfCompressorPage />
            </Suspense>
          }
        />
        <Route path="qr-code-generator" element={<QrCodeGeneratorPage />} />
        <Route path="qr-decoder" element={<QrDecoderPage />} />
        <Route path="json-comparer" element={<JsonComparerPage />} />
        <Route path="json-visualiser" element={<JsonVisualiserPage />} />
        <Route path="text-comparer" element={<TextComparerPage />} />
        <Route path="base64" element={<Base64Page />} />
        <Route path=":toolId" element={<ComingSoonPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
