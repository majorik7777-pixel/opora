import type { Metadata } from "next";
import Link from "next/link";
import { getProgramAccess } from "@opora/core";
import { ROUTES } from "@opora/shared";
import { Container, Disclaimer, buttonStyles } from "@opora/ui";
import { requireOnboardedUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Доступ открыт",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Страница успешной оплаты. Как и `/welcome`, нужна для цели по URL: оплата
 * засчитывается по визиту, даже если JS-событие `pay_dev_start` заблокировано.
 */
export default async function PurchaseSuccessPage() {
  const user = await requireOnboardedUser();
  const access = await getProgramAccess(user.id, "rasstavanie");

  return (
    <Container size="narrow" className="py-12 sm:py-16">
      <p className="inline-flex items-center rounded-full bg-sage-soft px-3.5 py-1.5 text-[13px] font-medium text-sage-deep">
        {access.active ? "Доступ открыт" : "Проверяем оплату"}
      </p>
      <h1 className="mt-5 text-3xl leading-tight tracking-[-0.03em] sm:text-4xl">
        {access.active ? "Программа твоя. Начнём с первого дня." : "Платёж обрабатывается"}
      </h1>
      <p className="mt-4 max-w-lg text-base leading-7 text-muted">
        {access.active
          ? "Открывай день 1 — это десять минут. Дальше программа сама будет вести по дням, а дневник и чат всегда рядом."
          : "Если доступ не появился в течение пары минут — напиши нам, разберёмся вручную."}
      </p>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href={access.active ? ROUTES.appProgram : ROUTES.app}
          className={buttonStyles({ variant: "signal", size: "lg" })}
          data-ym="purchase_to_program"
        >
          {access.active ? "Открыть программу" : "Вернуться в приложение"}
        </Link>
        <Link href={ROUTES.appChat} className={buttonStyles({ variant: "secondary", size: "lg" })}>
          Поговорить с Опорой
        </Link>
      </div>

      <div className="mt-10 space-y-2">
        <Disclaimer>
          Чек придёт на почту. Возврат — по условиям оферты, без уговоров и
          «осталось N мест».
        </Disclaimer>
      </div>
    </Container>
  );
}
