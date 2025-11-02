import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits recommended for GCM
const KEY_LENGTH = 32; // 256 bits

function getKeyFromEnv(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) throw new Error('ENCRYPTION_KEY not set');
  // assume key is hex or base64; support both: prefer hex if length 64
  if (key.length === 64 && /^[0-9a-fA-F]+$/.test(key)) {
    return Buffer.from(key, 'hex');
  }
  // otherwise treat as base64
  return Buffer.from(key, 'base64');
}

/**
 * Encrypt plaintext -> single base64 string containing iv|tag|ciphertext
 */
export function encryptField(plaintext: string): string {
  if (!plaintext) return plaintext;
  const key = getKeyFromEnv();
  if (key.length !== KEY_LENGTH) throw new Error('ENCRYPTION_KEY must be 32 bytes (base64 or 64-hex chars)');

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(Buffer.from(plaintext, 'utf8')), cipher.final()]);
  const tag = cipher.getAuthTag();

  // store as base64(iv || tag || ciphertext)
  const storeBuf = Buffer.concat([iv, tag, ciphertext]);
  return storeBuf.toString('base64');
}

/**
 * Decrypt the base64 string produced by encryptField
 */
export function decryptField(payloadBase64: string): string {
  if (!payloadBase64) return payloadBase64;
  const key = getKeyFromEnv();
  if (key.length !== KEY_LENGTH) throw new Error('ENCRYPTION_KEY must be 32 bytes (base64 or 64-hex chars)');

  const buf = Buffer.from(payloadBase64, 'base64');

  const iv = buf.slice(0, IV_LENGTH);
  const tag = buf.slice(IV_LENGTH, IV_LENGTH + 16); // GCM auth tag is 16 bytes
  const ciphertext = buf.slice(IV_LENGTH + 16);

  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const plainBuf = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plainBuf.toString('utf8');
}
