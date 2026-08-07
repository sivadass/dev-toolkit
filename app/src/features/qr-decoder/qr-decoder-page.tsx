import {
  Alert,
  Button,
  Container,
  FormControls,
  Typography,
} from "cleanplate";
import { ToolPageHeader } from "../../components/tool-page-header";
import { ACCEPTED_INPUT_TYPES } from "./decode-qr-code";
import { useQrDecoder } from "./use-qr-decoder";

export function QrDecoderPage() {
  const {
    file,
    setFilesFromControl,
    previewUrl,
    decodedText,
    error,
    isDecoding,
    copyFeedback,
    decode,
    copyResult,
  } = useQrDecoder();

  return (
    <>
      <ToolPageHeader
        kicker="Client-side · Private"
        title="QR Code Reader"
        subtitle="Decode a QR image locally — files never leave your device."
        primaryCta={
          <Button
            variant="solid"
            isLoading={isDecoding}
            isDisabled={!file || isDecoding}
            onClick={() => void decode()}
          >
            Decode
          </Button>
        }
      />

      {error ? <Alert message={error} variant="error" margin="t-4" /> : null}

      <FormControls.File
        label="QR image"
        variant="card"
        multiple={false}
        accept={ACCEPTED_INPUT_TYPES.join(",")}
        value={file ? [file] : []}
        onChange={(files) => setFilesFromControl(files)}
        dropZoneText="Drop a QR screenshot here"
        buttonLabel="Browse"
        isFluid
        margin={["t-4", "b-2"]}
        dataTestId="qr-image-file"
      />
      <Typography variant="small" margin="0">
        PNG, JPEG, WebP, or GIF up to 10 MB.
      </Typography>

      {file && previewUrl ? (
        <Container showBorder padding="4" margin="t-4" className="qr-preview">
          <Typography variant="h4" margin="0">
            Preview
          </Typography>
          <Typography variant="small" margin="t-2">
            {file.name}
          </Typography>
          <img src={previewUrl} alt="Uploaded QR preview" />
        </Container>
      ) : null}

      <Container display="block" margin="t-6" padding="0" aria-live="polite">
        <Container showBorder padding="4" margin="0" className="qr-decoder-result">
          <Typography variant="h4" margin="0">
            Result
          </Typography>

          {!decodedText ? (
            <Typography variant="small" margin="t-2">
              Decoded text will appear here.
            </Typography>
          ) : (
            <>
              <pre className="qr-decoder-result__text">{decodedText}</pre>
              <div className="qr-preview__actions">
                <Button variant="outline" onClick={() => void copyResult()}>
                  {copyFeedback ?? "Copy"}
                </Button>
              </div>
            </>
          )}
        </Container>
      </Container>
    </>
  );
}
