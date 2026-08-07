import {
  Alert,
  Button,
  Container,
  FormControls,
  Typography,
} from "cleanplate";
import { ToolPageHeader } from "../../components/tool-page-header";
import { ToolSurface } from "../../components/tool-surface";
import { formatBytes } from "../../lib/format-bytes";
import {
  QUALITY_PRESETS,
  type CompressMode,
  type QualityPresetId,
} from "./compress-pdf";
import { usePdfCompressor } from "./use-pdf-compressor";

const PRESET_OPTIONS = (
  Object.keys(QUALITY_PRESETS) as QualityPresetId[]
).map((id) => ({
  label: QUALITY_PRESETS[id].label,
  value: id,
}));

function classificationLabel(
  value: string | null,
  inspecting: boolean
): string {
  if (inspecting) return "Detecting…";
  if (!value) return "—";
  if (value === "scanned") return "Scanned";
  if (value === "text") return "Text";
  return "Mixed";
}

export function PdfCompressorPage() {
  const {
    file,
    setFilesFromControl,
    mode,
    setMode,
    presetId,
    setPresetId,
    pageCount,
    classification,
    warning,
    error,
    isCompressing,
    isInspecting,
    progress,
    result,
    compress,
    cancel,
  } = usePdfCompressor();

  const selectedPreset =
    PRESET_OPTIONS.find((o) => o.value === presetId) ?? PRESET_OPTIONS[1];

  const savings =
    result && result.originalBytes > 0
      ? Math.max(
          0,
          Math.round(
            (1 - result.compressedBytes / result.originalBytes) * 100
          )
        )
      : null;

  const expectationCopy =
    mode === "optimize" || classification === "text"
      ? "Structural optimize only — typical savings ~5–15%."
      : "Optimized for scanned documents — pages are re-rasterized; searchable text may be lost.";

  return (
    <>
      <ToolPageHeader
        kicker="Client-side · Private"
        title="PDF compressor"
        subtitle="Compress PDFs locally — files never leave your device."
        primaryCta={
          isCompressing ? (
            <Button variant="outline" onClick={cancel}>
              Cancel
            </Button>
          ) : (
            <Button
              variant="solid"
              isDisabled={!file || isInspecting}
              onClick={() => void compress()}
            >
              Compress
            </Button>
          )
        }
      />

      {error ? <Alert message={error} variant="error" margin="t-4" /> : null}
      {warning ? (
        <Alert message={warning} variant="warning" margin="t-4" />
      ) : null}

      <FormControls.File
        label="PDF file"
        variant="card"
        multiple={false}
        accept="application/pdf,.pdf"
        value={file ? [file] : []}
        onChange={(files) => setFilesFromControl(files)}
        dropZoneText="Drop a PDF here"
        buttonLabel="Browse"
        isFluid
        margin={["t-4", "b-2"]}
        dataTestId="pdf-file"
      />
      <Typography variant="small" margin="0">
        PDFs up to 200 MB. Large files may be slow in-browser. Nothing is
        uploaded — processing stays on your device.
      </Typography>

      {file ? (
        <Typography variant="small" margin="t-2">
          {file.name} · {formatBytes(file.size)}
          {pageCount != null ? ` · ${pageCount} page${pageCount === 1 ? "" : "s"}` : ""}
          {" · "}
          {classificationLabel(classification, isInspecting)}
        </Typography>
      ) : null}

      <Container display="block" margin="t-4" padding="0">
        <div className="options-row pdf-options-row">
          <FormControls.SegmentedControl
            label="Mode"
            name="pdf-mode"
            value={mode}
            onChange={(v) => setMode(String(v) as CompressMode)}
            options={[
              { label: "Auto", value: "auto" },
              { label: "Scanned", value: "scanned" },
              { label: "Optimize", value: "optimize" },
            ]}
            isFluid
            dataTestId="pdf-mode"
          />
          <FormControls.Select
            label="Quality preset"
            options={PRESET_OPTIONS}
            value={selectedPreset}
            searchable={false}
            isDisabled={mode === "optimize"}
            onChange={(option) => {
              if (option && !Array.isArray(option)) {
                setPresetId(String(option.value) as QualityPresetId);
              }
            }}
            isFluid
            margin="0"
            dataTestId="pdf-preset"
          />
        </div>
      </Container>
      <Typography variant="small" margin="t-2">
        {expectationCopy}
      </Typography>

      {isCompressing ? (
        <Typography variant="small" margin="t-4" className="pdf-progress">
          {progress
            ? `Compressing page ${progress.current} of ${progress.total}…`
            : mode === "optimize"
              ? "Optimizing…"
              : "Preparing…"}
        </Typography>
      ) : null}

      <Container display="block" margin="t-6" padding="0">
        <div className="preview-split">
          <ToolSurface>
            <Typography variant="h4" margin="0">
              Original
            </Typography>
            {file ? (
              <Typography variant="small" margin="t-2">
                {formatBytes(file.size)}
                {pageCount != null
                  ? ` · ${pageCount} page${pageCount === 1 ? "" : "s"}`
                  : ""}
              </Typography>
            ) : (
              <Typography variant="small" margin="t-2">
                Select a PDF to begin
              </Typography>
            )}
          </ToolSurface>
          <ToolSurface>
            <Typography variant="h4" margin="0">
              Compressed
            </Typography>
            {result ? (
              <>
                <Typography variant="small" margin="t-2">
                  {formatBytes(result.compressedBytes)}
                  {savings !== null ? ` · ${savings}% smaller` : ""}
                </Typography>
                <div className="pdf-preview-thumbs">
                  {result.firstPreviewUrl ? (
                    <img
                      src={result.firstPreviewUrl}
                      alt="First page preview"
                    />
                  ) : null}
                  {result.lastPreviewUrl ? (
                    <img
                      src={result.lastPreviewUrl}
                      alt="Last page preview"
                    />
                  ) : null}
                </div>
                <Button
                  variant="outline"
                  margin="t-4"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = result.url;
                    a.download = result.downloadName;
                    a.click();
                  }}
                >
                  Download
                </Button>
              </>
            ) : (
              <Typography variant="small" margin="t-2">
                Compress to preview
              </Typography>
            )}
          </ToolSurface>
        </div>
      </Container>
    </>
  );
}
