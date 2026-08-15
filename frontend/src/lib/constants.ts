// Mirrors app/schemas/secret.py — keep in sync with the backend contract.
export const MAX_PAYLOAD_LENGTH = 200_000;
export const MAX_TTL_SECONDS = 2_592_000; // 30 days
export const MAX_VIEWS_LIMIT = 100;

export const ENVELOPE_VERSION = 1;
export const IV_LENGTH_BYTES = 12;
export const GCM_TAG_LENGTH_BYTES = 16;
export const AES_KEY_LENGTH_BITS = 256;

export const TTL_PRESETS = [
  { label: "15 dakika", seconds: 15 * 60 },
  { label: "1 saat", seconds: 60 * 60 },
  { label: "1 gün", seconds: 24 * 60 * 60 },
  { label: "7 gün", seconds: 7 * 24 * 60 * 60 },
  { label: "30 gün", seconds: MAX_TTL_SECONDS },
] as const;

export const MAX_VIEWS_PRESETS = [1, 2, 5, 10] as const;

export const DEFAULT_TTL_SECONDS = 24 * 60 * 60;
export const DEFAULT_MAX_VIEWS = 1;
