import type { Metadata } from "next";
import Link from "next/link";
import { CRISIS_CONTACTS, CRISIS_CONTACTS_VERIFIED_AT, ROUTES } from "@opora/shared";
import { CRISIS_SCREEN_COPY } from "@opora/core";
import { Container, Disclaimer, buttonStyles } from "@opora/ui";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Нужна помощь сейчас",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Кризисный экран (T-105).
 *
 * Открывается из чата, когда классификатор относит сообщение к риску для жизни
 * или насилию. Задача страницы — не удержать пользователя в продукте, а вывести
 * его к человеку: телефоны крупно, ссылки tel:, ничего не продаём.
 */
export default async function SafetyPage() {
  await requireUser();

  return (
    <Container size="narrow" className="py-10 sm:py-14">
      <p className="inline-flex items-center rounded-full bg-accent-soft px-3.5 py-1.5 text-[13px] font-medium text-accent-strong">
        Помощь рядом
      </p>

      <h1 className="mt-5 text-3xl leading-tight tracking-[-0.03em] sm:text-4xl">
        {CRISIS_SCREEN_COPY.title}
      </h1>
      <p className="mt-4 max-w-lg text-base leading-7 text-ink/80">
        {CRISIS_SCREEN_COPY.lead}
      </p>

      <ul className="mt-7 divide-y divide-line border-y border-line">
        {CRISIS_CONTACTS.map((contact) => (
          <li key={contact.phone} className="py-4">
            <a
              href={`tel:${contact.tel}`}
              className="text-2xl font-semibold tracking-[-0.02em] text-ink underline-offset-4 hover:underline"
              data-ym="safety_call"
            >
              {contact.phone}
            </a>
            <p className="mt-1 text-sm text-ink/80">{contact.label}</p>
            <p className="mt-0.5 text-sm text-muted">{contact.note}</p>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs text-muted">
        Номера проверены {CRISIS_CONTACTS_VERIFIED_AT}. {CRISIS_SCREEN_COPY.note}
      </p>

      <div className="mt-8 rounded-card bg-sage-soft p-5">
        <p className="text-base font-semibold text-sage-deep">Что можно сделать прямо сейчас</p>
        <ul className="mt-2 space-y-1.5 text-sm leading-6 text-sage-deep/90">
          <li>· Позвонить близкому человеку и сказать прямо: «мне плохо, побудь со мной».</li>
          <li>· Выйти из комнаты, где ты одна: вода, окно, улица.</li>
          <li>· Не оставаться с этим ночью одной — можно написать в чат поддержки, но человек важнее.</li>
        </ul>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link href={ROUTES.app} className={buttonStyles({ variant: "secondary", size: "md" })}>
          Вернуться в приложение
        </Link>
      </div>

      <div className="mt-8 space-y-2">
        <Disclaimer>
          «Опора» не оказывает экстренную помощь и не заменяет специалиста. В
          ситуации угрозы жизни звони 112.
        </Disclaimer>
      </div>
    </Container>
  );
}
