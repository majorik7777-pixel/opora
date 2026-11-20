import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getPaymentsMode, getProgramAccess } from "@opora/core";
import { PROGRAM_PRICE_RUB, ROUTES } from "@opora/shared";
import { Container, Disclaimer, buttonStyles } from "@opora/ui";
import { purchaseDevAction } from "@/server/actions/billing";
import { requireOnboardedUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Оплата программы",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const PROGRAM_SLUG = "rasstavanie";

const INCLUDED = [
  "7 уроков и 7 практик по 10 минут",
  "Дневник с разбором записей",
  "Поддержка в чате каждый день",
  "Финальный отчёт и план на 30 дней",
  "Доступ навсегда",
] as const;

export default async function PaywallPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireOnboardedUser();
  const access = await getProgramAccess(user.id, PROGRAM_SLUG);
  if (access.active) redirect(ROUTES.appProgram);

  const mode = getPaymentsMode();
  const { error } = await searchParams;

  return (
    <Container size="narrow" className="py-10 sm:py-14">
      <p className="inline-flex items-center rounded-full bg-accent-soft px-3.5 py-1.5 text-[13px] font-medium text-accent-strong">
        Программа «Пережить расставание»
      </p>
      <h1 className="mt-5 text-3xl leading-tight tracking-[-0.03em] sm:text-4xl">
        Семь дней, чтобы вернуть опору
      </h1>
      <p className="mt-4 max-w-lg text-base leading-7 text-muted">
        Один урок и одна практика в день. Дневник, поддержка и финальный отчёт с
        планом на 30 дней.
      </p>

      <div className="mt-7 rounded-card border border-line bg-surface p-6 shadow-soft">
        <p className="text-4xl font-semibold tracking-[-0.03em]">
          {PROGRAM_PRICE_RUB} ₽
        </p>
        <p className="mt-1 text-sm text-muted">вся программа · доступ навсегда</p>

        <ul className="mt-4 divide-y divide-line border-y border-line text-sm">
          {INCLUDED.map((item) => (
            <li key={item} className="py-2.5">
              {item}
            </li>
          ))}
        </ul>

        {error ? (
          <p role="alert" className="mt-4 rounded-2xl bg-accent-soft p-3 text-sm text-ink">
            {error}
          </p>
        ) : null}

        {mode === "dev" ? (
          <>
            <form action={purchaseDevAction} className="mt-5">
              <input type="hidden" name="program" value={PROGRAM_SLUG} />
              <button
                type="submit"
                className={buttonStyles({ variant: "signal", size: "lg", fullWidth: true })}
                data-ym="pay_dev_start"
              >
                Открыть доступ — DEV-режим
              </button>
            </form>
            <p className="mt-3 text-xs leading-5 text-muted">
              Тестовый режим: деньги не списываются, доступ выдаётся сразу.
              ЮKassa подключим позже — интерфейс и страницы успеха останутся те же.
            </p>
          </>
        ) : (
          <div className="mt-5 rounded-2xl bg-sage-soft p-4 text-sm leading-6 text-sage-deep">
            Оплата пока недоступна: подключаем платёжный провайдер. Напиши нам —
            предупредим о запуске.
          </div>
        )}

        <p className="mt-4 text-sm text-muted">
          Возврат — по условиям{" "}
          <Link href={ROUTES.legal.offer} className="text-accent-deep underline underline-offset-2">
            оферты
          </Link>
          . Оплата картой или СБП, чек на почту.
        </p>
      </div>

      <div className="mt-8 space-y-2">
        <Disclaimer>
          Программа — инструмент самопомощи и рефлексии. Она не заменяет
          консультацию врача или психотерапевта и не обещает результата.
        </Disclaimer>
      </div>
    </Container>
  );
}
