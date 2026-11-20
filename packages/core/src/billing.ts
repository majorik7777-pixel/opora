import {
  PROGRAM_PRICE_RUB,
  actionFail,
  actionOk,
  type ActionResult,
} from "@opora/shared";
import {
  findActiveEntitlement,
  getDb,
  grantEntitlement,
  listEntitlements,
} from "@opora/db";
import type { EntitlementRow } from "@opora/db";
import { getEnv, uuidv7 } from "@opora/shared/server";

/**
 * Доступ к программам и оплата (T-104, пока DEV-режим).
 *
 * `PAYMENTS_MODE=dev` — покупка имитируется серверным действием: доступ выдаётся
 * сразу, денег не списываем. `off` — оплата выключена (production до подключения
 * ЮKassa). Реальный провайдер появится за тем же интерфейсом `startPurchase`.
 */

export type PaymentsMode = "dev" | "off";

export function getPaymentsMode(): PaymentsMode {
  const env = getEnv();
  if (env.PAYMENTS_MODE) return env.PAYMENTS_MODE;
  return env.NODE_ENV === "production" ? "off" : "dev";
}

export interface ProgramAccess {
  active: boolean;
  entitlement: EntitlementRow | null;
}

/** Есть ли доступ к программе у пользователя. */
export async function getProgramAccess(
  userId: string,
  programSlug: string,
): Promise<ProgramAccess> {
  const db = await getDb();
  const entitlement = await findActiveEntitlement(db, userId, programSlug);
  return { active: Boolean(entitlement), entitlement };
}

export async function listUserEntitlements(userId: string): Promise<EntitlementRow[]> {
  const db = await getDb();
  return listEntitlements(db, userId);
}

/**
 * DEV-покупка: выдаёт доступ без списания денег. В режиме `off` возвращает
 * ошибку, чтобы случайно не открыть платный контент в production.
 */
export async function startDevPurchase(
  userId: string,
  programSlug: string,
): Promise<ActionResult<{ entitlementId: string; price: number }>> {
  if (getPaymentsMode() !== "dev") {
    return actionFail(
      "CONFLICT",
      "Оплата пока недоступна: подключаем платёжный провайдер. Напиши нам — предупредим о запуске.",
    );
  }

  const db = await getDb();
  const existing = await findActiveEntitlement(db, userId, programSlug);
  if (existing) {
    return actionOk({ entitlementId: existing.id, price: PROGRAM_PRICE_RUB });
  }

  const entitlement = await grantEntitlement(db, {
    id: uuidv7(),
    userId,
    programSlug,
    source: "dev",
  });

  return actionOk({ entitlementId: entitlement.id, price: PROGRAM_PRICE_RUB });
}
