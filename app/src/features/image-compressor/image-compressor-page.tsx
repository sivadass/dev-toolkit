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
import { ACCEPTED_INPUT_TYPES, type OutputMimeType } from "./compress-image";
import { useImageCompressor } from "./use-image-compressor";

const FORMAT_OPTIONS: { label: string; value: OutputMimeType }[] = [
  { label: "WebP", value: "image/webp" },
  { label: "JPEG", value: "image/jpeg" },
  { label: "PNG", value: "image/png" },
];

export function ImageCompressorPage() {
  const {
    file,
    setFilesFromControl,
    quality,
    setQuality,
    maxDimension,
    setMaxDimension,
    outputType,
    setOutputType,
    originalUrl,
    result,
    error,
    isCompressing,
    compress,
  } = useImageCompressor();

  const selectedFormat =
    FORMAT_OPTIONS.find((o) => o.value === outputType) ?? FORMAT_OPTIONS[0];

  const savings =
    file && result
      ? Math.max(0, Math.round((1 - result.blob.size / file.size) * 100))
      : null;

  return (
    <>
      <ToolPageHeader
        kicker="Client-side · Private"
        title="Image compressor"
        subtitle="Compress PNG, JPG, WebP & GIF locally — files never leave your device."
      />

      {error ? <Alert message={error} variant="error" margin="t-4" /> : null}

      <div className="tool-primary-step">
        <div className="tool-primary-step__input">
          <FormControls.File
            label="Image file"
            variant="card"
            multiple={false}
            accept={ACCEPTED_INPUT_TYPES.join(",")}
            value={file ? [file] : []}
            onChange={(files) => setFilesFromControl(files)}
            dropZoneText="Drop an image here"
            buttonLabel="Browse"
            isFluid
            margin="0"
            dataTestId="image-file"
          />
          <Typography variant="small" margin="0" className="tool-hint">
            PNG, JPEG, WebP, or GIF up to 10 MB. Animated GIFs become a single
            frame. PNG output ignores the quality setting (browser behavior).
          </Typography>
        </div>
        <div className="tool-primary-step__action">
          <Button
            variant="solid"
            isLoading={isCompressing}
            isDisabled={!file || isCompressing}
            onClick={() => void compress()}
          >
            Compress
          </Button>
        </div>
      </div>

      <Container display="block" margin="t-4" padding="0">
        <div className="options-row">
          <FormControls.Stepper
            label="Quality"
            value={String(quality)}
            min={1}
            max={100}
            step={1}
            onChange={(e) => setQuality(Number(e.target.value) || 1)}
            isFluid
            margin="0"
            dataTestId="quality"
          />
          <FormControls.Stepper
            label="Max dimension (px)"
            value={String(maxDimension)}
            min={0}
            max={10000}
            step={10}
            onChange={(e) => setMaxDimension(Number(e.target.value) || 0)}
            isFluid
            margin="0"
            dataTestId="max-dimension"
          />
          <FormControls.Select
            label="Output format"
            options={FORMAT_OPTIONS}
            value={selectedFormat}
            searchable={false}
            onChange={(option) => {
              if (option && !Array.isArray(option)) {
                setOutputType(String(option.value) as OutputMimeType);
              }
            }}
            isFluid
            margin="0"
            dataTestId="output-format"
          />
        </div>
      </Container>
      <Typography variant="small" margin="t-2">
        Max dimension 0 = no resize. Longest side is capped; images are never
        upscaled.
      </Typography>

      <Container display="block" margin="t-6" padding="0">
        <div className="preview-split">
          <ToolSurface>
            <Typography variant="h4" margin="0">
              Original
            </Typography>
            {file && originalUrl ? (
              <>
                <Typography variant="small" margin="t-2">
                  {file.name} · {formatBytes(file.size)}
                </Typography>
                <img src={originalUrl} alt="Original preview" />
              </>
            ) : (
              <Typography variant="small" margin="t-2">
                Select an image to preview
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
                  {result.width}×{result.height} · {formatBytes(result.blob.size)}
                  {savings !== null ? ` · ${savings}% smaller` : ""}
                </Typography>
                <img src={result.url} alt="Compressed preview" />
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
