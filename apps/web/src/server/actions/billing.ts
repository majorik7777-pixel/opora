"use server";

import { redirect } from "next/navigation";
import { startDevPurchase } from "@opora/core";
import { requireOnboardedUser } from "@/lib/session";

/**
 * DEV-оплата (T-104). Пока провайдер не подключён, действие выдаёт доступ сразу.
 * Когда появится ЮKassa, здесь будет создание платежа и уход на её страницу —
 * интерфейс и страницы успеха/ошибки остаются те же.
 */
export async function purchaseDevAction(formData: FormData): Promise<void> {
  const user = await requireOnboardedUser();
  const programSlug = String(formData.get("program") ?? "rasstavanie");

  const result = await startDevPurchase(user.id, programSlug);
  if (!result.ok) {
    redirect(`/paywall?error=${encodeURIComponent(result.message)}`);
  }

  redirect("/welcome/purchase");
}
