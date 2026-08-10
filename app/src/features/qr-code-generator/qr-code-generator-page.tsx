import {
  Alert,
  Button,
  Container,
  FormControls,
  Icon,
  Typography,
} from "cleanplate";
import { LOGO_ACCEPTED_TYPES } from "./composite-qr-logo";
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
    logoFile,
    setLogoFiles,
    result,
    error,
  } = useQrCodeGenerator();

  const selectedEcc =
    ECC_OPTIONS.find((o) => o.value === errorCorrectionLevel) ?? ECC_OPTIONS[1];
  const hasResult = Boolean(result);

  return (
    <>
      <h1 className="visually-hidden">QR Code generator</h1>

      {error ? <Alert message={error} variant="error" margin="b-4" /> : null}

      <Container display="block" margin="0" padding="0">
        <div className="qr-layout">
          <section className="qr-stage" aria-label="QR preview">
            <div
              className={`qr-preview-stage${hasResult ? " is-ready" : " is-dimmed"}`}
              aria-live="polite"
            >
              <div className="qr-preview-stage__plate">
                {result ? (
                  <img
                    className="qr-preview-stage__img"
                    src={result.pngDataUrl}
                    alt="QR code preview"
                    width={result.size}
                    height={result.size}
                  />
                ) : (
                  <Typography
                    variant="small"
                    margin="0"
                    className="qr-preview-stage__placeholder"
                  >
                    Enter content to preview
                  </Typography>
                )}
              </div>
            </div>

            <div className="qr-stage__footer">
              {result ? (
                <Typography
                  variant="small"
                  margin="0"
                  className="qr-preview-meta"
                >
                  {`${result.size}×${result.size}px`}
                </Typography>
              ) : null}
              <div className="qr-download-row">
                <Button
                  variant="solid"
                  isDisabled={!result}
                  onClick={() =>
                    result
                      ? downloadDataUrl(
                          result.pngDataUrl,
                          result.downloadNamePng
                        )
                      : undefined
                  }
                >
                  <Icon name="download" />
                  PNG
                </Button>
                <Button
                  variant="outline"
                  isDisabled={!result}
                  onClick={() =>
                    result
                      ? downloadSvg(result.svgString, result.downloadNameSvg)
                      : undefined
                  }
                >
                  <Icon name="download" />
                  SVG
                </Button>
              </div>
            </div>
          </section>

          <section className="qr-inspector" aria-label="QR options">
            <FormControls.TextArea
              label="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="https://example.com"
              isFluid
              margin="0"
              dataTestId="qr-content"
            />
            <Typography variant="small" margin="0" className="tool-hint">
              Up to {MAX_CONTENT_LENGTH} characters. Updates live.
            </Typography>

            <div className="qr-inspector__section">
              <Typography
                variant="small"
                margin="0"
                className="qr-section-title"
              >
                Colors
              </Typography>
              <div
                className="qr-options-row qr-options-row--two"
                data-testid="qr-color-row"
              >
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
            </div>

            <details className="qr-advanced">
              <summary className="qr-advanced__summary">
                <Icon name="tune" />
                Advanced
              </summary>
              <div className="qr-advanced__body">
                <FormControls.File
                  label="Logo"
                  variant="card"
                  multiple={false}
                  accept={LOGO_ACCEPTED_TYPES.join(",")}
                  value={logoFile ? [logoFile] : []}
                  onChange={(files) => setLogoFiles(files)}
                  dropZoneText="Add a logo"
                  buttonLabel="Browse"
                  isFluid
                  margin="0"
                  dataTestId="qr-logo-file"
                />
                <Typography variant="small" margin="0" className="tool-hint">
                  Optional. Keep it small for scan reliability.
                </Typography>

                <div className="qr-options-row qr-options-row--two">
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
                </div>
              </div>
            </details>
          </section>
        </div>
      </Container>
    </>
  );
}
