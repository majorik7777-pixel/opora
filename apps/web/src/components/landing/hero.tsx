import Link from "next/link";
import { ROUTES } from "@opora/shared";
import { buttonStyles, Container } from "@opora/ui";

const facts = [
  { value: "10 минут", label: "в день — всё, что нужно успеть" },
  { value: "5 сообщений", label: "в день с AI-собеседником бесплатно" },
  { value: "990 ₽", label: "за всю программу, доступ навсегда" },
] as const;

export function Hero() {
  return (
    <section className="bg-moss text-paper">
      <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-12 lg:gap-10 lg:py-24">
        <div className="lg:col-span-7">
          <p className="text-sm text-moss-soft">
            Онлайн-программа самопомощи · 18+
          </p>

          <h1 className="mt-5 text-[40px] font-medium leading-[1.02] tracking-[-0.03em] sm:text-[56px] lg:text-[72px]">
            Семь дней, чтобы вернуть опору после расставания
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-moss-soft sm:text-xl sm:leading-9">
            Дневник, поддержка и маленькие шаги. Без осуждения. Анонимно.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={ROUTES.onboarding}
              className={buttonStyles({
                size: "lg",
                variant: "paper",
                className:
                  "focus-visible:ring-paper focus-visible:ring-offset-moss",
              })}
            >
              Начать бесплатно
            </Link>
            <a
              href="#seven-days"
              className="inline-flex min-h-11 items-center px-1 text-sm text-moss-soft underline underline-offset-4 hover:text-paper"
            >
              Как это работает
            </a>
          </div>

          <p className="mt-4 text-sm text-moss-soft">
            Первый день — бесплатно. Карта не нужна.
          </p>

          <p className="mt-10 max-w-md text-sm leading-6 text-moss-soft">
            Если сейчас очень тяжело — начни с бесплатного разговора. Это
            займёт минуту.
          </p>
        </div>

        {/* Плакат вместо героической иллюстрации: типографика как «событие». */}
        <div className="lg:col-span-5">
          <div className="relative border border-moss-deep bg-paper p-6 text-ink sm:p-8 lg:mt-10">
            <div className="flex items-baseline justify-between gap-4 border-b border-line pb-4">
              <span className="text-sm text-muted">Программа · 7 дней</span>
              <span className="text-sm tabular-nums text-muted">01—07</span>
            </div>

            <p className="event-serif mt-8 text-[26px] leading-[1.25] sm:text-[32px]">
              «Это не слабость. Это больно — и с этим можно работать».
            </p>

            <div className="mt-8 space-y-2 border-t border-line pt-4 text-sm text-muted">
              <p>Урок · практика · дневник · поддержка</p>
              <p>Каждый день — один маленький шаг.</p>
            </div>
          </div>
        </div>
      </Container>

      <div className="border-t border-paper/15">
        <Container className="grid gap-6 py-8 sm:grid-cols-3">
          {facts.map((fact) => (
            <div key={fact.value} className="border-l border-paper/25 pl-4">
              <p className="text-xl font-medium">{fact.value}</p>
              <p className="mt-1 text-sm leading-6 text-moss-soft">{fact.label}</p>
            </div>
          ))}
        </Container>
      </div>
    </section>
  );
}
