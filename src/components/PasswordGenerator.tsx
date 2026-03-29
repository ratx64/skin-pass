import { useState, useCallback, useRef, useEffect, type ChangeEvent } from 'react';
import { validateInspectLink, generatePassword } from '../utils/passwordGenerator';
import { InspectLink, PasswordResult } from '../types';
import { securityConfig, browserSecurity } from '../config/security';
import { estimateCrackTime } from '../utils/estimateCrackTime';

const CountdownTimer = ({ endTime }: { endTime: number }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const seconds = Math.ceil(timeLeft / 1000);
  return (
    <span className="text-sm text-warning">
      {seconds > 0 ? `Please wait ${seconds}s` : ''}
    </span>
  );
};

const SecurityInfo = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-8 p-4 bg-[#001233]/50 rounded-xl border border-[#00f7ff]/10">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left group"
      >
        <h3 className="text-lg font-medium text-[#00f7ff]">Security Information</h3>
        <span className="text-xl text-[#00f7ff] group-hover:text-[#0066ff] transition-colors">
          {isExpanded ? '−' : '+'}
        </span>
      </button>
      
      {isExpanded && (
        <div className="mt-4 space-y-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium text-[#00f7ff]">What This Tool Provides</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>🔒 Secure password generation from inspect links</li>
              <li>🔄 Reversible conversion (password ↔ link)</li>
              <li>🛡️ Protection against common attacks</li>
              <li>📱 Local-only processing</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-[#ff3366]">What This Tool Does NOT Provide</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>❌ Protection against keyloggers</li>
              <li>❌ Protection against screen capture</li>
              <li>❌ Protection against clipboard monitoring</li>
              <li>❌ Protection against malware</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-[#00f7ff]">Best Practices</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>Store passwords in a secure password manager</li>
              <li>Use unique passwords for different services</li>
              <li>Enable two-factor authentication where available</li>
              <li>Keep your operating system and browser updated</li>
              <li>Be cautious of screen recording software</li>
            </ul>
          </div>

          <div className="text-xs text-gray-400">
            For more detailed security information, please refer to our security documentation.
          </div>
        </div>
      )}
    </div>
  );
};

const PasswordGenerator = () => {
  const [inspectLink, setInspectLink] = useState<string>('');
  const [linkValidation, setLinkValidation] = useState<InspectLink | null>(null);
  const [passwordResult, setPasswordResult] = useState<PasswordResult | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitEndTime, setRateLimitEndTime] = useState<number>(0);
  const [securityWarnings, setSecurityWarnings] = useState<string[]>([]);
  const [crackTimeInfo, setCrackTimeInfo] = useState<{ score: number; crackTimeDisplay: string } | null>(null);
  
  const attemptHistory = useRef<number[]>([]);

  // Check browser security on mount
  useEffect(() => {
    if (securityConfig.browserSecurity.preventExtensions) {
      const hasExtensions = !browserSecurity.preventExtensionAccess();
      if (hasExtensions) {
        setSecurityWarnings(prev => [
          ...prev,
          'Browser extensions detected. For maximum security, please consider using a private/incognito window or temporarily disabling extensions.'
        ]);
      }
    }
  }, []);

  const isRateLimited = useCallback(() => {
    const now = Date.now();
    const { maxAttempts, timeWindow } = securityConfig.rateLimit;
    
    // Remove attempts outside the time window
    attemptHistory.current = attemptHistory.current.filter(
      timestamp => now - timestamp < timeWindow
    );
    
    const limited = attemptHistory.current.length >= maxAttempts;
    if (limited) {
      const oldestAttempt = Math.min(...attemptHistory.current);
      setRateLimitEndTime(oldestAttempt + timeWindow);
    }
    
    return limited;
  }, []);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInspectLink(value);
    setError(null);
    setPasswordResult(null);
    setCrackTimeInfo(null);
    
    if (value) {
      const validation = validateInspectLink(value);
      setLinkValidation(validation);
      
      if (!validation.isValid) {
        setError(validation.validationErrors[0]);
      }
    } else {
      setLinkValidation(null);
    }
  }, []);

  const handleGeneratePassword = useCallback(async () => {
    console.log('handleGeneratePassword function CALLED');

    if (!linkValidation?.isValid) return;

    if (isRateLimited()) {
      setError('Too many attempts. Please wait a moment before trying again.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setPasswordResult(null);
    setCrackTimeInfo(null);
    attemptHistory.current.push(Date.now());

    try {
      const result = await generatePassword(linkValidation);
      console.log('Password Generation Result:', result);
      setPasswordResult(result);
      
      if (result && result.password) {
        if (result.warnings.length > 0) {
          setSecurityWarnings(prev => [...new Set([...prev, ...result.warnings])]);
        }
        
        const crackEstimate = await estimateCrackTime(result.password);
        console.log('Crack Time Estimate:', crackEstimate);
        setCrackTimeInfo(crackEstimate);
      } else {
        console.error('Password generation failed or returned invalid result', result);
        setError('Failed to generate password data.');
      }

    } catch (err) {
      console.error('Error during password generation:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate password');
      setCrackTimeInfo(null);
    } finally {
      setIsGenerating(false);
    }
  }, [linkValidation, isRateLimited]);

  const handleCopyPassword = async () => {
    if (!passwordResult) return;

    try {
      if (securityConfig.browserSecurity.secureClipboard) {
        await browserSecurity.secureClipboard(passwordResult.password);
      } else {
        await navigator.clipboard.writeText(passwordResult.password);
      }
    } catch (e) {
      console.error('Failed to copy password:', e);
    }
  };

  // Log state just before rendering
  console.log('Rendering with State:', { passwordResult, crackTimeInfo });

  return (
    <div className="space-y-6">
      {securityWarnings.length > 0 && (
        <div className="p-4 bg-[#ffcc00]/10 border border-[#ffcc00]/20 rounded-lg">
          <h3 className="text-[#ffcc00] font-medium mb-2">Security Notice</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
            {securityWarnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div>
        <label htmlFor="inspect-link" className="block text-sm font-medium mb-2 text-[#00f7ff]">
          CS2 Skin Inspect Link
        </label>
        <input
          id="inspect-link"
          type="text"
          value={inspectLink}
          onChange={handleInputChange}
          placeholder="steam://run/730//+csgo_econ_action_preview%20..."
          className="w-full px-4 py-3 bg-[#000814]/50 border border-[#00f7ff]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00f7ff]/50 transition-colors"
        />
        {error && (
          <p className="mt-2 text-[#ff3366] text-sm">{error}</p>
        )}
      </div>

      <div className="flex justify-end items-center gap-4">
        {isRateLimited() && <CountdownTimer endTime={rateLimitEndTime} />}
        <button
          onClick={handleGeneratePassword}
          disabled={!linkValidation?.isValid || isGenerating || isRateLimited()}
          className="px-6 py-3 bg-gradient-to-r from-[#00f7ff] to-[#0066ff] text-white rounded-lg font-medium shadow-lg shadow-[#00f7ff]/10 hover:shadow-[#00f7ff]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isGenerating ? 'Generating...' : 'Generate Password'}
        </button>
      </div>

      {passwordResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <input
                type="text"
                value={passwordResult.password}
                readOnly
                className="w-full px-4 py-3 bg-[#000814]/50 border border-[#00f7ff]/20 rounded-lg font-mono text-[#00f7ff] focus:outline-none"
              />
            </div>
            <button
              onClick={handleCopyPassword}
              className="ml-4 px-6 py-3 bg-[#001233] border border-[#00f7ff]/20 text-[#00f7ff] rounded-lg font-medium hover:bg-[#00f7ff]/10 transition-colors"
            >
              Copy
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Password Strength:</span>
              <span className={`font-medium ${
                passwordResult.strength > 0.75 ? 'text-[#00f7ff]' :
                passwordResult.strength > 0.5 ? 'text-[#ffcc00]' :
                'text-[#ff3366]'
              }`}>
                {passwordResult.strength > 0.75 ? 'Strong' : passwordResult.strength > 0.5 ? 'Moderate' : 'Weak'}
              </span>
            </div>

            {crackTimeInfo && (
              <div className="flex items-center justify-between text-sm mt-1"> 
                <span className="text-gray-300">Est. Time to Crack:</span>
                <span className="font-medium text-gray-100">
                  {crackTimeInfo.crackTimeDisplay}
                </span>
              </div>
            )}

            <div className="w-full bg-[#001233] rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  passwordResult.strength > 0.75 ? 'bg-gradient-to-r from-[#00f7ff] to-[#0066ff]' :
                  passwordResult.strength > 0.5 ? 'bg-[#ffcc00]' :
                  'bg-[#ff3366]'
                }`}
                style={{ width: `${Math.max(5, passwordResult.strength * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Entropy:</span>
              <span className="font-mono text-[#00f7ff]">
                {passwordResult.entropy.toFixed(2)} bits
              </span>
            </div>
          </div>

          {passwordResult.warnings.length > 0 && (
            <div className="mt-4 p-4 bg-[#ff3366]/10 rounded-lg border border-[#ff3366]/20">
              <h3 className="text-[#ff3366] font-medium mb-2">Security Warnings</h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                {passwordResult.warnings.map((warning, index) => (
                  <li key={index} className="text-gray-300">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <SecurityInfo />
        </div>
      )}
    </div>
  );
};

export default PasswordGenerator; 
