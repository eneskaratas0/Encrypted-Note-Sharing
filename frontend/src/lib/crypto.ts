import { base64UrlDecode, base64UrlEncode } from "@/lib/base64url";
import { AES_KEY_LENGTH_BITS, ENVELOPE_VERSION, GCM_TAG_LENGTH_BYTES, IV_LENGTH_BYTES } from "@/lib/constants";

export class UnsupportedEnvelopeVersionError extends Error {
  constructor() {
    super("Unsupported envelope version");
    this.name = "UnsupportedEnvelopeVersionError";
  }
}

export class DecryptionFailedError extends Error {
  constructor() {
    super("Decryption failed");
    this.name = "DecryptionFailedError";
  }
}

/** Generates a fresh, extractable AES-GCM 256-bit key for a new note. */
export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: AES_KEY_LENGTH_BITS }, true, [
    "encrypt",
    "decrypt",
  ]);
}

/** Exports a key as a base64url string suitable for a URL fragment. */
export async function exportKeyToFragment(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey("raw", key);
  return base64UrlEncode(new Uint8Array(raw));
}

/** Imports a decrypt-only key from a URL fragment's base64url string. */
export async function importKeyFromFragment(fragmentKey: string): Promise<CryptoKey> {
  const raw = base64UrlDecode(fragmentKey);
  return crypto.subtle.importKey("raw", raw as BufferSource, "AES-GCM", false, ["decrypt"]);
}

/**
 * Envelope layout: [version:1 byte][iv:12 bytes][ciphertext+GCM tag:N bytes],
 * base64url-encoded as a whole. This *is* the opaque `encrypted_payload`
 * string sent to and stored by the server.
 */
export async function encryptNote(plaintext: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH_BYTES));
  const plaintextBytes = new TextEncoder().encode(plaintext);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintextBytes as BufferSource),
  );

  const envelope = new Uint8Array(1 + iv.length + ciphertext.length);
  envelope[0] = ENVELOPE_VERSION;
  envelope.set(iv, 1);
  envelope.set(ciphertext, 1 + iv.length);

  return base64UrlEncode(envelope);
}

export async function decryptNote(encryptedPayload: string, key: CryptoKey): Promise<string> {
  const envelope = base64UrlDecode(encryptedPayload);

  if (envelope.length < 1 + IV_LENGTH_BYTES) {
    throw new DecryptionFailedError();
  }
  if (envelope[0] !== ENVELOPE_VERSION) {
    throw new UnsupportedEnvelopeVersionError();
  }

  const iv = envelope.slice(1, 1 + IV_LENGTH_BYTES);
  const ciphertext = envelope.slice(1 + IV_LENGTH_BYTES);

  try {
    const plaintextBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as BufferSource },
      key,
      ciphertext as BufferSource,
    );
    return new TextDecoder().decode(plaintextBuffer);
  } catch {
    // GCM auth-tag mismatch (wrong key or tampered payload) — never leak
    // raw WebCrypto error details to the UI.
    throw new DecryptionFailedError();
  }
}

/** Estimated base64url `encrypted_payload` length for a given plaintext byte length. */
export function estimateEncryptedPayloadLength(plaintextByteLength: number): number {
  const envelopeBytes = 1 + IV_LENGTH_BYTES + plaintextByteLength + GCM_TAG_LENGTH_BYTES;
  return Math.ceil(envelopeBytes / 3) * 4;
}
