import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
} from "node:crypto";
import { getEnv } from "./env";

const IV_BYTES = 12;
const TAG_BYTES = 16;

/**
 * Ключ AES-256-GCM из ENCRYPTION_KEY (base64, 32 байта).
 * Психологические данные — специальная категория ПДн (08-legal-pdn.md §5),
 * поэтому чувствительные поля шифруются на уровне приложения.
 */
export function getEncryptionKey(): Buffer {
  const configured = getEnv().ENCRYPTION_KEY;
  const key = Buffer.from(configured, "base64");
  if (key.length !== 32) {
    throw new Error(
      "ENCRYPTION_KEY должен быть валидным base64 ровно на 32 байта (256 бит). Сгенерируй: openssl rand -base64 32",
    );
  }
  return key;
}

function encrypt(plaintext: Buffer): Buffer {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]);
}

function decrypt(payload: Buffer): Buffer {
  if (payload.length < IV_BYTES + TAG_BYTES) {
    throw new Error("Повреждённые зашифрованные данные");
  }
  const iv = payload.subarray(0, IV_BYTES);
  const tag = payload.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
  const ciphertext = payload.subarray(IV_BYTES + TAG_BYTES);

  const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

/** Шифрует JSON в base64url-строку (для cookie и текстовых колонок БД). */
export function sealJson(value: unknown): string {
  return encrypt(Buffer.from(JSON.stringify(value), "utf8")).toString("base64url");
}

/** Расшифровывает base64url-строку, созданную sealJson. Бросает при подмене. */
export function openJson<T>(token: string): T {
  return JSON.parse(
    decrypt(Buffer.from(token, "base64url")).toString("utf8"),
  ) as T;
}

/** Шифрует строку (например, email) в base64url. */
export function sealText(text: string): string {
  return encrypt(Buffer.from(text, "utf8")).toString("base64url");
}

export function openText(token: string): string {
  return decrypt(Buffer.from(token, "base64url")).toString("utf8");
}

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function hmacHex(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

/** Токен для magic link и сессий: 32 случайных байта в base64url. */
export function randomToken(byteLength = 32): string {
  return randomBytes(byteLength).toString("base64url");
}

/** HMAC-отпечаток email — по нему ищем пользователя, сам email хранится зашифрованным. */
export function hashEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  return hmacHex(`email:${normalized}`, getEnv().AUTH_SECRET);
}

/** HMAC-отпечаток IP — для согласий и rate limit без хранения IP в открытом виде. */
export function hashIp(ip: string): string {
  return hmacHex(`ip:${ip}`, getEnv().AUTH_SECRET);
}
