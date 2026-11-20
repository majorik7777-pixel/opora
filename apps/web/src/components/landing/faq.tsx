import { Container } from "@opora/ui";

import type { Program } from "@/content/programs/types";

export function FaqSection({ program }: { program: Program }) {
  return (
    <section id="faq" aria-labelledby="faq-title" className="border-t border-line py-10 sm:py-20">
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-4">
          <h2
            id="faq-title"
            className="text-[32px] leading-[1.06] tracking-[-0.03em] sm:text-[44px]"
          >
            Частые вопросы
          </h2>
          <p className="mt-4 max-w-sm text-[15px] leading-7 text-muted">
            Не нашла ответ? Напиши нам — ответим без шаблонов.
          </p>
        </div>

        <div className="lg:col-span-8">
          {program.faq.map((item) => (
            <details
              key={item.question}
              className="group border-t border-line py-1.5 last:border-b sm:py-4"
            >
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-semibold leading-6 [&::-webkit-details-marker]:hidden sm:text-lg">
                {item.question}
                <span
                  aria-hidden="true"
                  className="text-2xl font-normal leading-none text-accent-strong transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-2 max-w-2xl text-[15px] leading-7 text-muted sm:text-base">{item.answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
