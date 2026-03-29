import { useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { Converter } from './components/ui/Converter';
import { validateInspectLink, generatePassword } from './utils/passwordGenerator';
import { estimateCrackTime, CrackTimeEstimate } from './utils/estimateCrackTime';
import { SecurityDisclaimer } from './components/ui/SecurityDisclaimer';
import { ErrorDisplay } from './components/ui/ErrorDisplay';
import { handleError } from './utils/errorHandler';
import { AlgorithmVersion, ErrorCategory } from './types';

interface ConvertRequest {
  inspectLink: string;
  secretPhrase: string;
  algorithmVersion: AlgorithmVersion;
}

function App() {
  const [error, setError] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [crackTimeInfo, setCrackTimeInfo] = useState<CrackTimeEstimate | null>(null);

  const handleConvert = async ({
    inspectLink,
    secretPhrase,
    algorithmVersion,
  }: ConvertRequest): Promise<string> => {
    setIsConverting(true);
    setError(null);
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
      const password = result.password;

      const crackEstimate = await estimateCrackTime(password);
      setCrackTimeInfo(crackEstimate);

      return password;

    } catch (error) {
      setCrackTimeInfo(null);
      const appError = handleError(
        error,
        ErrorCategory.VALIDATION,
        { inspectLink, algorithmVersion }
      );
      setError(appError.message);
      throw appError;
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <MainLayout>
      <Converter 
        onConvert={handleConvert} 
        isConverting={isConverting} 
        crackTimeInfo={crackTimeInfo}
      />
      <SecurityDisclaimer />
      {error && <ErrorDisplay message={error} />}
    </MainLayout>
  );
}

export default App;
