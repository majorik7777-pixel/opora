import { randomBytes } from "node:crypto";

/**
 * UUID v7: time-ordered идентификаторы (12-tech-plan.md §4).
 * Первые 48 бит — unix-время в мс, остальное — случайность.
 */
export function uuidv7(now: number = Date.now()): string {
  const bytes = randomBytes(16);
  const timestamp = BigInt(now);

  bytes[0] = Number((timestamp >> 40n) & 0xffn);
  bytes[1] = Number((timestamp >> 32n) & 0xffn);
  bytes[2] = Number((timestamp >> 24n) & 0xffn);
  bytes[3] = Number((timestamp >> 16n) & 0xffn);
  bytes[4] = Number((timestamp >> 8n) & 0xffn);
  bytes[5] = Number(timestamp & 0xffn);

  const versionByte = bytes[6] ?? 0;
  bytes[6] = (versionByte & 0x0f) | 0x70;

  const variantByte = bytes[8] ?? 0;
  bytes[8] = (variantByte & 0x3f) | 0x80;

  const hex = bytes.toString("hex");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}
