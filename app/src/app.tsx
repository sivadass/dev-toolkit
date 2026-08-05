import { Route, Routes } from "react-router-dom";
import { ImageCompressorPage } from "./features/image-compressor/image-compressor-page";
import { JsonComparerPage } from "./features/json-comparer/json-comparer-page";
import { QrCodeGeneratorPage } from "./features/qr-code-generator/qr-code-generator-page";
import { HomeLayout } from "./layouts/home-layout";
import { ToolLayout } from "./layouts/tool-layout";
import { ComingSoonPage } from "./pages/coming-soon-page";
import { HomePage } from "./pages/home-page";
import { NotFoundPage } from "./pages/not-found-page";

export function App() {
  return (
    <Routes>
      <Route element={<HomeLayout />}>
        <Route index element={<HomePage />} />
      </Route>
      <Route path="/tools" element={<ToolLayout />}>
        <Route path="image-compressor" element={<ImageCompressorPage />} />
        <Route path="qr-code-generator" element={<QrCodeGeneratorPage />} />
        <Route path="json-comparer" element={<JsonComparerPage />} />
        <Route path=":toolId" element={<ComingSoonPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
