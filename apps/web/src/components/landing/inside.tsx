import { Container } from "@opora/ui";

import type { Program } from "@/content/programs/types";

import { Photo } from "./photo";

export function InsideSection({ program }: { program: Program }) {
  return (
    <section
      id="inside"
      aria-labelledby="inside-title"
      className="border-t border-line py-10 sm:py-20"
    >
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <h2
            id="inside-title"
            className="text-[32px] leading-[1.06] tracking-[-0.03em] sm:text-[44px]"
          >
            Внутри — семь дней, а не сто уроков.
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-7 text-muted sm:text-base">
            Каждый день — один урок, одна практика и два вопроса для рефлексии.
            Без домашних заданий на три часа и чувства вины, если пропустила.
          </p>
          <div className="mt-8 hidden aspect-[4/3] overflow-hidden rounded-card border border-line sm:block">
            <Photo
              name="notebook"
              widths={[700, 1200]}
              width={1200}
              height={900}
              sizes="(min-width: 1024px) 38vw, 100vw"
              alt="Рабочий стол у окна: блокнот, ручка, чай и телефон"
            />
          </div>
        </div>

        <ul className="divide-y divide-line border-y border-line lg:col-span-7">
          {program.inside.map((item, index) => (
            <li
              key={item.title}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-4 sm:grid sm:grid-cols-12 sm:gap-5 sm:py-5"
            >
              <p className="text-[13px] font-semibold tabular-nums text-accent-strong sm:col-span-1">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="text-lg font-semibold sm:col-span-4">{item.title}</h3>
              <p className="w-full text-[15px] leading-6 text-muted sm:col-span-7 sm:w-auto">
                {item.text}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
