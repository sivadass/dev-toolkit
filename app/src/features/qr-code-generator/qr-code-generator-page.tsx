import {
  Alert,
  Button,
  Container,
  FormControls,
  Typography,
} from "cleanplate";
import { ToolPageHeader } from "../../components/tool-page-header";
import { ToolSurface } from "../../components/tool-surface";
import type { ErrorCorrectionLevel } from "./generate-qr-code";
import { MAX_CONTENT_LENGTH, MAX_SIZE, MIN_SIZE } from "./generate-qr-code";
import { useQrCodeGenerator } from "./use-qr-code-generator";

const ECC_OPTIONS: {
  label: string;
  value: ErrorCorrectionLevel;
  meta: string;
}[] = [
  { label: "L (~7%)", value: "L", meta: "Lowest recovery" },
  { label: "M (~15%)", value: "M", meta: "Balanced" },
  { label: "Q (~25%)", value: "Q", meta: "Higher recovery" },
  { label: "H (~30%)", value: "H", meta: "Highest recovery" },
];

function downloadDataUrl(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.click();
}

function downloadSvg(svgString: string, filename: string) {
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, filename);
  URL.revokeObjectURL(url);
}

export function QrCodeGeneratorPage() {
  const {
    content,
    setContent,
    size,
    setSize,
    errorCorrectionLevel,
    setErrorCorrectionLevel,
    foreground,
    setForeground,
    background,
    setBackground,
    result,
    error,
    isGenerating,
    canGenerate,
    generate,
  } = useQrCodeGenerator();

  const selectedEcc =
    ECC_OPTIONS.find((o) => o.value === errorCorrectionLevel) ?? ECC_OPTIONS[1];

  return (
    <>
      <ToolPageHeader
        kicker="Client-side · Private"
        title="QR Code generator"
        subtitle="Generate a QR code from text or a URL."
        primaryCta={
          <Button
            variant="solid"
            isLoading={isGenerating}
            isDisabled={!canGenerate || isGenerating}
            onClick={() => void generate()}
          >
            Generate
          </Button>
        }
      />

      {error ? <Alert message={error} variant="error" margin="t-4" /> : null}

      <FormControls.TextArea
        label="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="https://example.com"
        isFluid
        margin={["t-4", "b-2"]}
        dataTestId="qr-content"
      />
      <Typography variant="small" margin="0">
        Up to {MAX_CONTENT_LENGTH} characters. URLs, text, or any string.
      </Typography>

      <Container display="block" margin="t-4" padding="0">
        <div className="qr-options-row">
          <FormControls.Stepper
            label="Size (px)"
            value={String(size)}
            min={MIN_SIZE}
            max={MAX_SIZE}
            step={32}
            onChange={(e) => setSize(Number(e.target.value) || MIN_SIZE)}
            isFluid
            margin="0"
            dataTestId="qr-size"
          />
          <FormControls.Select
            label="Error correction"
            options={ECC_OPTIONS}
            value={selectedEcc}
            searchable={false}
            onChange={(option) => {
              if (option && !Array.isArray(option)) {
                setErrorCorrectionLevel(
                  String(option.value) as ErrorCorrectionLevel
                );
              }
            }}
            isFluid
            margin="0"
            dataTestId="qr-ecc"
          />
          <FormControls.ColorPicker
            label="Foreground"
            value={foreground}
            onChange={(color) => {
              if (color) setForeground(color);
            }}
            clearable={false}
            isFluid
            margin="0"
            dataTestId="qr-foreground"
          />
          <FormControls.ColorPicker
            label="Background"
            value={background}
            onChange={(color) => {
              if (color) setBackground(color);
            }}
            clearable={false}
            isFluid
            margin="0"
            dataTestId="qr-background"
          />
        </div>
      </Container>

      <Container display="block" margin="t-6" padding="0">
        <ToolSurface className="qr-preview">
          <Typography variant="h4" margin="0">
            Preview
          </Typography>
          {result ? (
            <>
              <Typography variant="small" margin="t-2">
                {result.size}×{result.size}px
              </Typography>
              <img
                src={result.pngDataUrl}
                alt="QR code preview"
                style={{ ["--qr-preview-size" as string]: `${result.size}px` }}
              />
              <div className="qr-preview__actions">
                <Button
                  variant="outline"
                  margin="t-4"
                  onClick={() =>
                    downloadDataUrl(result.pngDataUrl, result.downloadNamePng)
                  }
                >
                  Download PNG
                </Button>
                <Button
                  variant="outline"
                  margin="t-4"
                  onClick={() =>
                    downloadSvg(result.svgString, result.downloadNameSvg)
                  }
                >
                  Download SVG
                </Button>
              </div>
            </>
          ) : (
            <Typography variant="small" margin="t-2">
              Generate to preview
            </Typography>
          )}
        </ToolSurface>
      </Container>
    </>
  );
}
