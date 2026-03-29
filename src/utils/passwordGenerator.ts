import { characterSets, securityConfig, memorySecurity } from '../config/security';
import {
  InspectLink,
  PasswordResult,
  SecurityCheck,
  PasswordGenerationOptions,
  InspectLinkFormat,
  AlgorithmVersion,
} from '../types';

const DEFAULT_ALGORITHM_VERSION: AlgorithmVersion = 'v2';
const LEGACY_PATTERN = /S(\d+)A(\d+)D(\d+)/;
const MODERN_PATTERN = /csgo_econ_action_preview(?:%20|\s)([A-Za-z0-9]+)/i;

const calculateEntropy = (password: string): number => {
  const charSetSize =
    (password.match(/[a-z]/) ? characterSets.lowercase.length : 0) +
    (password.match(/[A-Z]/) ? characterSets.uppercase.length : 0) +
    (password.match(/[0-9]/) ? characterSets.numbers.length : 0) +
    (password.match(/[^a-zA-Z0-9]/) ? characterSets.special.length : 0);

  return Math.log2(charSetSize) * password.length;
};

const checkPasswordRequirements = (password: string): SecurityCheck[] => {
  const { passwordRequirements } = securityConfig;
  const checks: SecurityCheck[] = [];

  const lowercaseCount = (password.match(/[a-z]/g) || []).length;
  const uppercaseCount = (password.match(/[A-Z]/g) || []).length;
  const numbersCount = (password.match(/[0-9]/g) || []).length;
  const specialCount = (password.match(/[^a-zA-Z0-9]/g) || []).length;

  checks.push({
    name: 'Lowercase Characters',
    passed: lowercaseCount >= passwordRequirements.minLowercase,
    details: `Found ${lowercaseCount} lowercase characters (minimum: ${passwordRequirements.minLowercase})`,
  });

  checks.push({
    name: 'Uppercase Characters',
    passed: uppercaseCount >= passwordRequirements.minUppercase,
    details: `Found ${uppercaseCount} uppercase characters (minimum: ${passwordRequirements.minUppercase})`,
  });

  checks.push({
    name: 'Numbers',
    passed: numbersCount >= passwordRequirements.minNumbers,
    details: `Found ${numbersCount} numbers (minimum: ${passwordRequirements.minNumbers})`,
  });

  checks.push({
    name: 'Special Characters',
    passed: specialCount >= passwordRequirements.minSpecial,
    details: `Found ${specialCount} special characters (minimum: ${passwordRequirements.minSpecial})`,
  });

  const repeatedChars = password.match(/(.)\1+/g) || [];
  const maxRepeated =
    repeatedChars.length > 0 ? Math.max(...repeatedChars.map((group) => group.length)) : 1;
  checks.push({
    name: 'Repeated Characters',
    passed: maxRepeated <= passwordRequirements.maxRepeatedChars,
    details: `Maximum repeated characters: ${maxRepeated} (maximum allowed: ${passwordRequirements.maxRepeatedChars})`,
  });

  let maxSequential = 0;
  for (let i = 0; i < password.length - 1; i++) {
    const current = password[i];
    const next = password[i + 1];

    const checkSequential = (set: string) => {
      const currentIndex = set.indexOf(current);
      const nextIndex = set.indexOf(next);
      if (currentIndex !== -1 && nextIndex !== -1 && Math.abs(currentIndex - nextIndex) === 1) {
        maxSequential = Math.max(maxSequential, 2);
        if (i < password.length - 2) {
          const nextNext = password[i + 2];
          const nextNextIndex = set.indexOf(nextNext);
          if (nextNextIndex !== -1 && Math.abs(nextIndex - nextNextIndex) === 1) {
            maxSequential = Math.max(maxSequential, 3);
          }
        }
      }
    };

    checkSequential(characterSets.lowercase);
    checkSequential(characterSets.uppercase);
    checkSequential(characterSets.numbers);
  }

  checks.push({
    name: 'Sequential Characters',
    passed: maxSequential <= passwordRequirements.maxSequentialChars,
    details: `Maximum sequential characters: ${maxSequential} (maximum allowed: ${passwordRequirements.maxSequentialChars})`,
  });

  return checks;
};

const performSecurityChecks = (password: string): SecurityCheck[] => {
  const basicChecks: SecurityCheck[] = [
    {
      name: 'Length Check',
      passed: password.length >= securityConfig.minPasswordLength,
      details: `Password length: ${password.length} (minimum: ${securityConfig.minPasswordLength})`,
    },
    {
      name: 'Entropy Check',
      passed: calculateEntropy(password) >= securityConfig.minEntropy,
      details: `Password entropy: ${calculateEntropy(password).toFixed(2)} (minimum: ${securityConfig.minEntropy})`,
    },
    {
      name: 'Character Diversity',
      passed: new Set(password).size >= Math.min(password.length, 8),
      details: `Unique characters: ${new Set(password).size}`,
    },
  ];

  const requirementChecks = checkPasswordRequirements(password);
  return [...basicChecks, ...requirementChecks];
};

const stripControlChars = (value: string): string =>
  Array.from(value)
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join('');

const normalizeUrl = (url: string): string => {
  const trimmedUrl = stripControlChars(url.trim());

  try {
    const normalized = new URL(trimmedUrl);
    return normalized.toString();
  } catch {
    return trimmedUrl;
  }
};

const detectInspectFormat = (url: string): InspectLinkFormat => {
  if (LEGACY_PATTERN.test(url)) {
    return 'legacy';
  }

  if (MODERN_PATTERN.test(url)) {
    return 'modern';
  }

  try {
    const decodedUrl = decodeURIComponent(url);
    if (MODERN_PATTERN.test(decodedUrl)) {
      return 'modern';
    }
  } catch {
    return 'unknown';
  }

  return 'unknown';
};

const extractUniqueId = (url: string): string => {
  const legacyMatch = url.match(LEGACY_PATTERN);
  if (legacyMatch) {
    return `${legacyMatch[1]}-${legacyMatch[2]}-${legacyMatch[3]}`;
  }

  const directMatch = url.match(MODERN_PATTERN);
  if (directMatch) {
    return directMatch[1];
  }

  try {
    const decoded = decodeURIComponent(url);
    const decodedMatch = decoded.match(MODERN_PATTERN);
    if (decodedMatch) {
      return decodedMatch[1];
    }
  } catch {
    return '';
  }

  return '';
};

const validateInspectLink = (url: string): InspectLink => {
  if (typeof url !== 'string') {
    return {
      url: '',
      isValid: false,
      uniqueId: '',
      normalizedUrl: '',
      format: 'unknown',
      validationErrors: ['URL must be a string'],
    };
  }

  const normalizedUrl = normalizeUrl(url);
  const uniqueId = extractUniqueId(normalizedUrl);
  const format = detectInspectFormat(normalizedUrl);
  const validationErrors: string[] = [];

  if (normalizedUrl.length > securityConfig.maxUrlLength) {
    validationErrors.push(`URL exceeds maximum length of ${securityConfig.maxUrlLength} characters`);
  }

  if (!securityConfig.allowedProtocols.some((protocol) => normalizedUrl.startsWith(protocol))) {
    validationErrors.push('URL must start with steam: protocol');
  }

  if (!normalizedUrl.includes('csgo_econ_action_preview')) {
    validationErrors.push('URL must be a CS2 skin inspect link');
  }

  if (!uniqueId) {
    validationErrors.push('Could not extract unique identifier from URL. Please ensure you are using a valid CS2 skin inspect link.');
  }

  return {
    url: normalizedUrl,
    isValid: validationErrors.length === 0,
    uniqueId,
    normalizedUrl,
    format,
    validationErrors,
  };
};

const deriveSeedV1 = async (normalizedUrl: string, secretPhrase: string): Promise<Uint8Array> => {
  const encoder = new TextEncoder();
  const material = `${normalizedUrl}|${secretPhrase}|skinpass:v1`;
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(material));
  return new Uint8Array(digest);
};

const deriveSeedV2 = async (normalizedUrl: string, secretPhrase: string): Promise<Uint8Array> => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(`skinpass:v2:${secretPhrase || 'public-mode'}`),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );

  const saltDigest = await crypto.subtle.digest(
    'SHA-256',
    encoder.encode(`inspect:${normalizedUrl}|algorithm:v2`),
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: saltDigest,
      iterations: Math.max(60000, securityConfig.hashIterations * 3),
    },
    keyMaterial,
    512,
  );

  return new Uint8Array(derivedBits);
};

const generatePasswordFromSeed = (seed: Uint8Array): string => {
  const pools = {
    lowercase: characterSets.lowercase,
    uppercase: characterSets.uppercase,
    numbers: characterSets.numbers,
    special: characterSets.special,
  };

  const minLength = Math.max(16, securityConfig.minPasswordLength);
  const minLowercase = Math.max(4, Math.floor(minLength * 0.3));
  const minUppercase = Math.max(4, Math.floor(minLength * 0.3));
  const minNumbers = Math.max(3, Math.floor(minLength * 0.2));
  const minSpecial = Math.max(2, Math.floor(minLength * 0.2));

  const getSeedByte = (index: number): number => seed[index % seed.length];

  const requiredChars: string[] = [];
  const generateChars = (pool: string, count: number, offset: number) => {
    for (let i = 0; i < count; i++) {
      const index = getSeedByte(i + offset) % pool.length;
      requiredChars.push(pool[index]);
    }
  };

  generateChars(pools.lowercase, minLowercase, 0);
  generateChars(pools.uppercase, minUppercase, minLowercase);
  generateChars(pools.numbers, minNumbers, minLowercase + minUppercase);
  generateChars(pools.special, minSpecial, minLowercase + minUppercase + minNumbers);

  const remainingLength = minLength - requiredChars.length;
  for (let i = 0; i < remainingLength; i++) {
    const charType = getSeedByte(i + minLength) % 4;
    let pool: string;
    switch (charType) {
      case 0:
        pool = pools.lowercase;
        break;
      case 1:
        pool = pools.uppercase;
        break;
      case 2:
        pool = pools.numbers;
        break;
      case 3:
        pool = pools.special;
        break;
      default:
        pool = pools.lowercase;
    }

    const index = getSeedByte(i + remainingLength) % pool.length;
    requiredChars.push(pool[index]);
  }

  for (let i = requiredChars.length - 1; i > 0; i--) {
    const j = getSeedByte(i) % (i + 1);
    [requiredChars[i], requiredChars[j]] = [requiredChars[j], requiredChars[i]];
  }

  return requiredChars.join('');
};

const generatePassword = async (
  link: InspectLink,
  options: PasswordGenerationOptions = {},
): Promise<PasswordResult> => {
  if (!link.isValid) {
    throw new Error('Invalid inspect link');
  }

  const algorithmVersion = options.algorithmVersion ?? DEFAULT_ALGORITHM_VERSION;
  const secretPhrase = (options.secretPhrase ?? '').trim();
  const effectiveSecret = secretPhrase || 'public';

  const seed =
    algorithmVersion === 'v1'
      ? await deriveSeedV1(link.normalizedUrl, effectiveSecret)
      : await deriveSeedV2(link.normalizedUrl, effectiveSecret);

  let finalPassword = generatePasswordFromSeed(seed);
  const securityChecks = performSecurityChecks(finalPassword);
  const entropy = calculateEntropy(finalPassword);
  const strength = securityChecks.filter((check) => check.passed).length / securityChecks.length;

  if (securityConfig.memorySecurity.wipeMemory) {
    memorySecurity.secureClear(seed);
    memorySecurity.clearAfterTimeout(finalPassword, securityConfig.memorySecurity.clearInterval);
  }

  if (securityConfig.memorySecurity.memoryProtection) {
    finalPassword = memorySecurity.protectMemory(finalPassword);
  }

  const warnings: string[] = [];
  if (!secretPhrase) {
    warnings.push('No secret phrase set. Anyone with this inspect link can reproduce this password.');
  }
  if (algorithmVersion === 'v1') {
    warnings.push('Legacy algorithm selected for compatibility. Use v2 for stronger derivation.');
  }
  warnings.push(
    ...securityChecks
      .filter((check) => !check.passed)
      .map((check) => `${check.name}: ${check.details}`),
  );

  return {
    password: finalPassword,
    algorithmVersion,
    inspectFormat: link.format,
    strength,
    entropy,
    isDeterministic: true,
    securityChecks,
    warnings,
  };
};

export { validateInspectLink, generatePassword, calculateEntropy, performSecurityChecks };
