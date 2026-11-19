"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logout, requestMagicLink } from "@opora/core";
import {
  COOKIE_NAMES,
  actionFail,
  magicLinkRequestSchema,
  type ActionResult,
} from "@opora/shared";
import { getClientIpHash } from "@/lib/request";

export type RequestMagicLinkActionResult = ActionResult<{ devLink?: string }>;

/** Server action: запросить magic link на почту. */
export async function requestMagicLinkAction(
  _previousState: RequestMagicLinkActionResult | null,
  formData: FormData,
): Promise<RequestMagicLinkActionResult> {
  const parsed = magicLinkRequestSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return actionFail(
      "VALIDATION",
      parsed.error.issues[0]?.message ?? "Проверь адрес почты",
    );
  }

  const ipHash = await getClientIpHash();
  return requestMagicLink({ email: parsed.data.email, ipHash });
}

/** Server action: выйти из аккаунта. */
export async function logoutAction(): Promise<void> {
  const store = await cookies();
  await logout(store.get(COOKIE_NAMES.session)?.value ?? null);
  store.delete(COOKIE_NAMES.session);
  redirect("/");
}
