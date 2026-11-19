import { Container } from "@opora/ui";

import type { Program } from "@/content/programs/types";

import { Photo } from "./photo";

export function InsideSection({ program }: { program: Program }) {
  return (
    <section
      id="inside"
      aria-labelledby="inside-title"
      className="border-t border-line py-14 sm:py-20"
    >
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <h2
            id="inside-title"
            className="text-[30px] leading-[1.05] tracking-[-0.03em] sm:text-[40px]"
          >
            Внутри — семь дней, а не сто уроков.
          </h2>
          <p className="mt-4 max-w-md text-base leading-7 text-muted">
            Каждый день — один урок, одна практика и два вопроса для рефлексии.
            Без домашних заданий на три часа и чувства вины, если пропустила.
          </p>
          <div className="mt-7 aspect-[4/3] overflow-hidden rounded-card border border-line">
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

        <ul className="border-b border-line lg:col-span-7">
          {program.inside.map((item) => (
            <li key={item.title} className="border-t border-line py-5">
              <h3 className="text-xl font-medium">{item.title}</h3>
              <p className="mt-1 max-w-xl text-base leading-7 text-muted">{item.text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
