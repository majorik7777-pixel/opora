import { headers } from "next/headers";
import { hashIp } from "@opora/shared/server";

/**
 * HMAC-отпечаток IP для rate limit и согласий. Сам IP не храним (152-ФЗ:
 * минимизация). За прокси берём первый адрес X-Forwarded-For.
 */
export async function getClientIpHash(): Promise<string | null> {
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for") ?? "";
  const ip =
    forwarded.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";
  return hashIp(ip);
}
