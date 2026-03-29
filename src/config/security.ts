import { SecurityConfig } from '../types';

export const securityConfig: SecurityConfig = {
  minPasswordLength: 16,
  minEntropy: 100,
  requiredSpecialChars: true,
  hashIterations: 20000,
  saltLength: 64,
  maxUrlLength: 2048,
  allowedProtocols: ['steam:'],
  allowedDomains: ['steamcommunity.com'],
  rateLimit: {
    maxAttempts: 3,
    timeWindow: 60 * 1000, // 1 minute
  },
  passwordRequirements: {
    minLowercase: 4,
    minUppercase: 4,
    minNumbers: 3,
    minSpecial: 2,
    maxRepeatedChars: 2,
    maxSequentialChars: 2,
  },
  memorySecurity: {
    clearInterval: 3000,
    wipeMemory: true,
    secureAllocation: true,
    memoryProtection: true,
  },
  browserSecurity: {
    preventExtensions: false,
    secureClipboard: true,
    domProtection: false,
  },
};

export const characterSets = {
  // Basic character sets that are universally accepted
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  // Common special characters that are accepted by most systems
  special: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  // Remove extended special and unicode as they may cause compatibility issues
};

export const securityHeaders = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none';",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export const memorySecurity = {
  clearSensitiveData: (data: string): void => {
    const randomData = new Uint8Array(data.length);
    for (let i = 0; i < 3; i++) {
      crypto.getRandomValues(randomData);
      data = randomData.toString();
    }
  },

  secureClear: (array: Uint8Array): void => {
    for (let i = 0; i < 3; i++) {
      crypto.getRandomValues(array);
      array.fill(0);
    }
  },

  clearAfterTimeout: (data: string, timeout: number): void => {
    setTimeout(() => {
      memorySecurity.clearSensitiveData(data);
    }, timeout);
  },

  secureAllocation: (size: number): Uint8Array => {
    const array = new Uint8Array(size);
    crypto.getRandomValues(array);
    return array;
  },

  protectMemory: (data: string): string => {
    const encoder = new TextEncoder();
    const dataArray = encoder.encode(data);
    const protectedArray = memorySecurity.secureAllocation(dataArray.length);
    protectedArray.set(dataArray);
    return new TextDecoder().decode(protectedArray);
  },
};

export const browserSecurity = {
  preventExtensionAccess: (): boolean => true,

  secureClipboard: async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      console.error('Clipboard access denied');
    }
  },

  protectDOM: (): void => {
    // Intentionally a no-op.
    // Client-side scripts cannot reliably "protect" DOM from a compromised browser.
  },
}; 
