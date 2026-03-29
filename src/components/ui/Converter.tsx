import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { Input } from './Input';
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
  }) => Promise<string>;
  isConverting: boolean;
  crackTimeInfo: CrackTimeEstimate | null;
}

const SAMPLE_LINKS = [
  {
    label: 'Modern Sample',
    value:
      'steam://run/730//+csgo_econ_action_preview%206F7FC5AFF797D36E776D4F8967476A5F6B57EE9891826C2FB16807071F67605B78D3',
  },
  {
    label: 'Legacy Sample',
    value:
      'steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S76561198144091202A40446467891D5630817826245312529',
  },
  {
    label: 'Modern Sample 2',
    value:
      'steam://run/730//+csgo_econ_action_preview%20AB71DD34A8E9C7AA0F11DB5B773C0A95D52CBF2D9237A840E9614A9A97B40519',
  },
];

export const Converter = ({ onConvert, isConverting, crackTimeInfo }: ConverterProps) => {
  const [input, setInput] = useState('');
  const [secretPhrase, setSecretPhrase] = useState('');
  const [algorithmVersion, setAlgorithmVersion] = useState<AlgorithmVersion>('v2');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPasting, setIsPasting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSamples, setShowSamples] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const validation = useMemo(() => (input ? validateInspectLink(input) : null), [input]);

  const handleConvert = async (inspectLink: string) => {
    try {
      const result = await onConvert({
        inspectLink,
        secretPhrase,
        algorithmVersion,
      });
      setOutput(result);
      setCopied(false);
      setFeedback(null);
    } catch {
      setOutput('');
      setFeedback('Conversion failed. Check your inspect link and try again.');
    }
  };

  const handleManualConvert = async () => {
    if (!validation?.isValid) {
      setFeedback(validation?.validationErrors[0] ?? 'Please enter a valid inspect link.');
      return;
    }

    await handleConvert(input);
  };

  const handlePasteAndConvert = async () => {
    setIsPasting(true);
    try {
      const pastedText = await navigator.clipboard.readText();
      const trimmed = pastedText.trim();
      if (!trimmed) {
        setFeedback('Clipboard is empty.');
        return;
      }

      setInput(trimmed);
      const pastedValidation = validateInspectLink(trimmed);
      if (!pastedValidation.isValid) {
        setFeedback(pastedValidation.validationErrors[0]);
        return;
      }

      await handleConvert(trimmed);
    } catch {
      setFeedback('Could not read clipboard. Paste manually or allow clipboard permissions.');
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
    setShowSamples(false);
  };

  const handleClearOutput = () => {
    setOutput('');
    setCopied(false);
    setFeedback(null);
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setFeedback('Failed to copy password.');
    }
  };

  const handleUseSample = (sampleValue: string) => {
    setInput(sampleValue);
    setFeedback(null);
  };

  const validationMeta = (() => {
    if (!input || !validation) return { text: 'Awaiting inspect link', tone: 'neutral' as const };
    if (!validation.isValid) {
      return { text: validation.validationErrors[0], tone: 'error' as const };
    }
    return {
      text: validation.format === 'legacy' ? 'Legacy format detected' : 'Modern format detected',
      tone: 'success' as const,
    };
  })();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="max-w-[540px] mx-auto rounded-sm cs2-panel p-4"
    >
      <div className="flex items-center justify-between border-b border-[#6f90b0]/40 pb-2 mb-3">
        <div>
          <h2 className="cs2-hud-text text-[1.8rem] leading-none text-[#d9ecff]">Inspect Password Terminal</h2>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#8eb2d6] mt-0.5">
            Deterministic Offline Conversion
          </p>
        </div>
        <button
          onClick={() => setShowSamples((prev) => !prev)}
          className="rounded-sm border border-[#6d8fb0]/60 px-2 py-1 text-[11px] uppercase tracking-[0.12em] text-[#c6def4] hover:text-white hover:border-[#9fc2e7] transition-colors"
        >
          {showSamples ? 'Hide Samples' : 'Load Samples'}
        </button>
      </div>

      <div className="flex items-center justify-between mb-3 text-[11px] uppercase tracking-[0.12em]">
        <span className="text-[#8eb2d6]">Status</span>
        <span
          className={
            validationMeta.tone === 'success'
              ? 'text-[#b8ff6f]'
              : validationMeta.tone === 'error'
                ? 'text-[#ff968b]'
                : 'text-[#c7dbef]'
          }
        >
          {validationMeta.text}
        </span>
      </div>

      <div className="space-y-3">
        {showSamples && (
          <div className="cs2-subpanel rounded-sm p-2.5">
            <div className="flex flex-wrap gap-2">
              {SAMPLE_LINKS.map((sample) => (
                <button
                  key={sample.label}
                  onClick={() => handleUseSample(sample.value)}
                  className="rounded-sm border border-[#6d8fb0]/60 bg-[#203041] px-2 py-1.5 text-[11px] uppercase tracking-[0.1em] text-[#d2e7fb] hover:border-[#a1c6eb] hover:text-white transition-colors"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <Input
          label="CS2 Inspect Link"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="steam://run/730//+csgo_econ_action_preview%20..."
        />

        <div className="cs2-subpanel rounded-sm p-2.5">
          <button
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="w-full flex items-center justify-between text-[12px] uppercase tracking-[0.12em] text-[#cde2f6] hover:text-white transition-colors"
          >
            <span>Advanced Options</span>
            <span className="text-[#8fb2d5]">{showAdvanced ? 'Hide' : 'Show'}</span>
          </button>

          {showAdvanced && (
            <div className="mt-3 space-y-3">
              <Input
                label="Secret Phrase (Optional)"
                type="password"
                value={secretPhrase}
                onChange={(e) => setSecretPhrase(e.target.value)}
                placeholder="Add your private phrase"
              />
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#b8cde3] mb-2">
                  Algorithm
                </label>
                <select
                  value={algorithmVersion}
                  onChange={(e) => setAlgorithmVersion(e.target.value as AlgorithmVersion)}
                  className="block w-full rounded-sm border border-[#5f7c99]/50 bg-[#182534] py-2.5 px-3.5 text-[#e9f4ff] focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
                >
                  <option value="v2">v2 (Recommended)</option>
                  <option value="v1">v1 (Legacy compatibility)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button
            onClick={handleManualConvert}
            disabled={!validation?.isValid || isConverting || isPasting}
            isLoading={isConverting}
          >
            Convert
          </Button>
          <Button
            onClick={handlePasteAndConvert}
            variant="secondary"
            disabled={isConverting || isPasting}
            isLoading={isPasting}
          >
            Paste & Convert
          </Button>
        </div>

        <button
          onClick={handleClearAll}
          disabled={!input && !output && !secretPhrase}
          className="text-[11px] uppercase tracking-[0.12em] text-[#9cb7d3] hover:text-[#dbeeff] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Clear All Fields
        </button>

        {feedback && (
          <div className="rounded-sm border border-[#e8584f]/45 bg-[#34191a] px-3 py-2 text-xs text-[#ffb0a6] uppercase tracking-[0.08em]">
            {feedback}
          </div>
        )}

        {output && (
          <div className="space-y-3 pt-2 border-t border-[#6488aa]/35">
            <Input label="Generated Password" value={output} readOnly className="font-mono" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button onClick={handleCopy} variant="secondary">
                {copied ? (
                  <>
                    <CheckIcon className="w-4 h-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <CopyIcon className="w-4 h-4 mr-2" />
                    Copy Password
                  </>
                )}
              </Button>
              <Button onClick={handleClearOutput} variant="secondary">
                Clear Output
              </Button>
            </div>

            {crackTimeInfo && (
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.12em] text-[#9eb9d4]">
                <span>Est. Time to Crack</span>
                <span className="font-semibold text-[#f4d04f]">{formatLargeTime(crackTimeInfo.crackTimeSeconds)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
