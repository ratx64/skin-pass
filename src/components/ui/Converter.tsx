import { useId, useMemo, useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { ErrorDisplay } from './ErrorDisplay';
import { CopyIcon, CheckIcon } from '@radix-ui/react-icons';
import { CrackTimeEstimate } from '../../utils/estimateCrackTime';
import { formatLargeTime } from '../../utils/formatTime';
import { validateInspectLink } from '../../utils/passwordGenerator';
import { AlgorithmVersion } from '../../types';

interface ConverterProps {
  onConvert: (request: {
    inspectLink: string;
    secretPhrase: string;
    algorithmVersion: AlgorithmVersion;
  }) => Promise<string | null>;
  onInvalidate: () => void;
  isConverting: boolean;
  crackTimeInfo: CrackTimeEstimate | null;
  error: string | null;
  warnings: string[];
}

const SAMPLE_LINKS = [
  {
    label: 'Modern',
    value:
      'steam://run/730//+csgo_econ_action_preview%206F7FC5AFF797D36E776D4F8967476A5F6B57EE9891826C2FB16807071F67605B78D3',
  },
  {
    label: 'Legacy',
    value:
      'steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S76561198144091202A40446467891D5630817826245312529',
  },
  {
    label: 'Modern 2',
    value:
      'steam://run/730//+csgo_econ_action_preview%20AB71DD34A8E9C7AA0F11DB5B773C0A95D52CBF2D9237A840E9614A9A97B40519',
  },
];

export const Converter = ({
  onConvert,
  onInvalidate,
  isConverting,
  crackTimeInfo,
  error,
  warnings,
}: ConverterProps) => {
  const advancedId = useId();
  const algorithmHintId = useId();
  const [input, setInput] = useState('');
  const [secretPhrase, setSecretPhrase] = useState('');
  const [algorithmVersion, setAlgorithmVersion] = useState<AlgorithmVersion>('v2');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPasting, setIsPasting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const validation = useMemo(() => (input ? validateInspectLink(input) : null), [input]);
  const fieldError = input && validation && !validation.isValid ? validation.validationErrors[0] : undefined;
  const formatLabel =
    validation?.isValid && validation.format === 'legacy' ? 'Legacy format' : validation?.isValid ? 'Modern format' : null;

  const clearResult = () => {
    setOutput('');
    setCopied(false);
    onInvalidate();
  };

  const handleConvert = async (inspectLink: string) => {
    setFeedback(null);
    try {
      const result = await onConvert({
        inspectLink,
        secretPhrase,
        algorithmVersion,
      });
      if (!result) return;
      setOutput(result);
      setCopied(false);
    } catch {
      setOutput('');
    }
  };

  const handleManualConvert = async () => {
    if (!input.trim()) {
      setFeedback('Enter an inspect link.');
      return;
    }

    if (!validation?.isValid) {
      setFeedback(null);
      return;
    }

    await handleConvert(input);
  };

  const handlePasteAndConvert = async () => {
    setIsPasting(true);
    setFeedback(null);
    try {
      const pastedText = await navigator.clipboard.readText();
      const trimmed = pastedText.trim();
      if (!trimmed) {
        setFeedback('Clipboard is empty.');
        return;
      }

      setInput(trimmed);
      clearResult();
      const pastedValidation = validateInspectLink(trimmed);
      if (!pastedValidation.isValid) {
        return;
      }

      await handleConvert(trimmed);
    } catch {
      setFeedback('Could not read the clipboard. Paste the link into the field, or allow clipboard access.');
    } finally {
      setIsPasting(false);
    }
  };

  const handleClearAll = () => {
    setInput('');
    setSecretPhrase('');
    setOutput('');
    setCopied(false);
    setFeedback(null);
    setAlgorithmVersion('v2');
    setShowAdvanced(false);
    onInvalidate();
  };

  const handleClearOutput = () => {
    setOutput('');
    setCopied(false);
    setFeedback(null);
    onInvalidate();
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setFeedback(null);
    } catch {
      setFeedback('Could not copy the password.');
    }
  };

  const handleUseSample = (sampleValue: string) => {
    setInput(sampleValue);
    setFeedback(null);
    setOutput('');
    setCopied(false);
    onInvalidate();
  };

  const updateInput = (value: string) => {
    setInput(value);
    setFeedback(null);
    setOutput('');
    setCopied(false);
    onInvalidate();
  };

  const alertMessage = feedback || error;

  return (
    <form
      className="form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void handleManualConvert();
      }}
    >
      <div>
        <h1 className="title">Inspect link to password</h1>
        <p className="lede">
          Paste a CS2 inspect link. The same link and secret phrase always return the same password. Nothing is
          uploaded.
        </p>
      </div>

      <Input
        label="Inspect link"
        value={input}
        onChange={(event) => updateInput(event.target.value)}
        placeholder="steam://run/730//+csgo_econ_action_preview…"
        error={fieldError}
        hint={formatLabel ?? undefined}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        autoComplete="off"
        required
      />

      <div className="field-block">
        <p className="meta" id="sample-links">
          Try a sample
        </p>
        <div className="sample-row" role="group" aria-labelledby="sample-links">
          {SAMPLE_LINKS.map((sample) => (
            <Button key={sample.label} variant="secondary" onClick={() => handleUseSample(sample.value)}>
              {sample.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <button
          type="button"
          className="disclosure"
          aria-expanded={showAdvanced}
          aria-controls={advancedId}
          onClick={() => setShowAdvanced((open) => !open)}
        >
          <span>Secret phrase and algorithm</span>
          <span className="disclosure-state">{showAdvanced ? 'Hide' : 'Show'}</span>
        </button>
        <div id={advancedId} className="advanced" hidden={!showAdvanced}>
          <Input
            label="Secret phrase"
            type="password"
            value={secretPhrase}
            onChange={(event) => {
              setSecretPhrase(event.target.value);
              if (output) {
                setOutput('');
                setCopied(false);
                onInvalidate();
              }
            }}
            placeholder="Optional"
            hint="Without a secret phrase, anyone with the inspect link can reproduce the password."
            autoComplete="off"
            spellCheck={false}
          />
          <div className="field-block">
            <label className="field-label" htmlFor="algorithm">
              Algorithm
            </label>
            <select
              id="algorithm"
              className="field"
              value={algorithmVersion}
              aria-describedby={algorithmHintId}
              onChange={(event) => {
                setAlgorithmVersion(event.target.value as AlgorithmVersion);
                if (output) {
                  setOutput('');
                  setCopied(false);
                  onInvalidate();
                }
              }}
            >
              <option value="v2">v2, recommended</option>
              <option value="v1">v1, for older passwords</option>
            </select>
            <p id={algorithmHintId} className="hint">
              v2 is the current derivation. Choose v1 only to match an older password.
            </p>
          </div>
        </div>
      </div>

      <div className="actions">
        <Button type="submit" disabled={isConverting || isPasting} isLoading={isConverting}>
          {isConverting ? 'Converting' : 'Convert'}
        </Button>
        <Button
          variant="secondary"
          onClick={() => void handlePasteAndConvert()}
          disabled={isConverting || isPasting}
          isLoading={isPasting}
        >
          {isPasting ? 'Pasting' : 'Paste and convert'}
        </Button>
      </div>

      {input || output || secretPhrase || algorithmVersion !== 'v2' ? (
        <Button variant="quiet" onClick={handleClearAll}>
          Clear fields
        </Button>
      ) : null}

      {alertMessage ? <ErrorDisplay message={alertMessage} /> : null}

      {output ? (
        <div className="result">
          <Input
            label="Password"
            value={output}
            readOnly
            className="field-mono"
            spellCheck={false}
            autoComplete="off"
            onFocus={(event) => event.currentTarget.select()}
          />
          <div className="actions">
            <Button variant="secondary" onClick={() => void handleCopy()}>
              {copied ? <CheckIcon width={16} height={16} aria-hidden="true" /> : <CopyIcon width={16} height={16} aria-hidden="true" />}
              {copied ? 'Copied' : 'Copy password'}
            </Button>
            <Button variant="secondary" onClick={handleClearOutput}>
              Clear password
            </Button>
          </div>
          <span className="sr-only" role="status">
            {copied ? 'Password copied.' : ''}
          </span>
          {crackTimeInfo ? (
            <dl className="stat">
              <dt className="meta">Crack time</dt>
              <dd>{formatLargeTime(crackTimeInfo.crackTimeSeconds)}</dd>
            </dl>
          ) : null}
          {warnings.length > 0 ? (
            <ul className="notes">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </form>
  );
};
