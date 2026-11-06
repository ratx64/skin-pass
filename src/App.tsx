import { useRef, useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { Converter } from './components/ui/Converter';
import { validateInspectLink, generatePassword } from './utils/passwordGenerator';
import { estimateCrackTime, CrackTimeEstimate } from './utils/estimateCrackTime';
import { SecurityDisclaimer } from './components/ui/SecurityDisclaimer';
import { handleError } from './utils/errorHandler';
import { AlgorithmVersion, ErrorCategory } from './types';

interface ConvertRequest {
  inspectLink: string;
  secretPhrase: string;
  algorithmVersion: AlgorithmVersion;
}

function App() {
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [crackTimeInfo, setCrackTimeInfo] = useState<CrackTimeEstimate | null>(null);
  const runRef = useRef(0);

  const invalidateResult = () => {
    runRef.current += 1;
    setIsConverting(false);
    setError(null);
    setWarnings([]);
    setCrackTimeInfo(null);
  };

  const handleConvert = async ({
    inspectLink,
    secretPhrase,
    algorithmVersion,
  }: ConvertRequest): Promise<string | null> => {
    const runId = ++runRef.current;
    setIsConverting(true);
    setError(null);
    setWarnings([]);
    setCrackTimeInfo(null);
    try {
      const validatedLink = validateInspectLink(inspectLink);
      if (!validatedLink.isValid) {
        throw new Error(validatedLink.validationErrors.join(', '));
      }

      const result = await generatePassword(validatedLink, {
        secretPhrase,
        algorithmVersion,
      });
      if (runId !== runRef.current) return null;

      const password = result.password;
      const crackEstimate = await estimateCrackTime(password);
      if (runId !== runRef.current) return null;

      setCrackTimeInfo(crackEstimate);
      setWarnings(result.warnings);
      return password;
    } catch (error) {
      if (runId !== runRef.current) return null;
      setCrackTimeInfo(null);
      setWarnings([]);
      const appError = handleError(error, ErrorCategory.VALIDATION, { inspectLink, algorithmVersion });
      setError(appError.message);
      throw appError;
    } finally {
      if (runId === runRef.current) setIsConverting(false);
    }
  };

  return (
    <MainLayout>
      <Converter
        onConvert={handleConvert}
        onInvalidate={invalidateResult}
        isConverting={isConverting}
        crackTimeInfo={crackTimeInfo}
        error={error}
        warnings={warnings}
      />
      <SecurityDisclaimer />
    </MainLayout>
  );
}

export default App;
