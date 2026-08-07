import {
  Alert,
  Button,
  FormControls,
  MenuList,
  PageHeader,
  Typography,
} from "cleanplate";
import { useBase64, type Base64Mode } from "./use-base64";

const TAB_ITEMS = [
  { label: "Encode", value: "encode" },
  { label: "Decode", value: "decode" },
];

export function Base64Page() {
  const {
    mode,
    setMode,
    encodeInput,
    setEncodeInput,
    encodeOutput,
    decodeInput,
    setDecodeInput,
    decodeOutput,
    urlSafe,
    setUrlSafe,
    error,
    copyFeedback,
    canConvert,
    convert,
    clear,
    copyOutput,
    activeInput,
    activeOutput,
  } = useBase64();

  const isEncode = mode === "encode";
  const inputValue = isEncode ? encodeInput : decodeInput;
  const outputValue = isEncode ? encodeOutput : decodeOutput;
  const setInput = isEncode ? setEncodeInput : setDecodeInput;

  return (
    <>
      <PageHeader
        title="Base64"
        subtitle="Encode and decode text — stays on-device."
        primaryCta={
          <Button
            variant="solid"
            isDisabled={!canConvert}
            onClick={() => convert()}
          >
            {isEncode ? "Encode" : "Decode"}
          </Button>
        }
      />

      <MenuList
        items={TAB_ITEMS}
        direction="horizontal"
        variant="light"
        activeItem={mode}
        onMenuClick={(item) => setMode(item.value as Base64Mode)}
        margin="t-4"
      />

      {error ? <Alert message={error} variant="error" margin="t-4" /> : null}

      {isEncode ? (
        <FormControls.Toggle
          label="URL-safe"
          checked={urlSafe}
          onChange={(checked) => setUrlSafe(checked)}
          margin="t-4"
          dataTestId="base64-url-safe"
        />
      ) : null}

      <FormControls.TextArea
        label={isEncode ? "Text" : "Base64"}
        value={inputValue}
        onChange={(e) => setInput(e.target.value)}
        placeholder={
          isEncode ? "Paste or type text to encode" : "Paste Base64 to decode"
        }
        isFluid
        margin="t-4"
        dataTestId="base64-input"
      />

      <FormControls.TextArea
        label={isEncode ? "Base64" : "Text"}
        value={outputValue}
        onChange={() => undefined}
        placeholder="Output appears here after you convert"
        isFluid
        margin="t-4"
        dataTestId="base64-output"
        isDisabled
      />

      <div className="text-pane-actions text-pane-actions--spaced">
        <Button variant="outline" onClick={() => clear()}>
          Clear
        </Button>
        <Button
          variant="outline"
          isDisabled={!activeOutput}
          onClick={() => void copyOutput()}
        >
          {copyFeedback ?? "Copy"}
        </Button>
      </div>

      {activeInput.trim().length === 0 && activeOutput.length === 0 ? (
        <Typography variant="small" margin="t-4">
          Choose Encode or Decode, enter text, then convert.
        </Typography>
      ) : null}
    </>
  );
}
