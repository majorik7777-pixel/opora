import Link from "next/link";
import { ROUTES } from "@opora/shared";
import { buttonStyles, Container } from "@opora/ui";

import type { Program } from "@/content/programs/types";

import { Photo } from "./photo";

export function PainSection({ program }: { program: Program }) {
  return (
    <section
      id="pains"
      aria-labelledby="pains-title"
      className="border-t border-line py-10 sm:py-20"
    >
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <div className="aspect-[3/2] overflow-hidden rounded-card border border-line sm:aspect-[4/5]">
            <Photo
              name="quiet-room"
              widths={[800, 1400]}
              width={1400}
              height={933}
              sizes="(min-width: 1024px) 40vw, 100vw"
              alt="Женщина сидит на полу у дивана в тихой комнате"
            />
          </div>
          <p className="mt-4 max-w-sm text-[15px] leading-6 text-muted">
            Не нужно «держаться» и делать вид, что всё в порядке. Можно прийти
            с тем, что есть.
          </p>
        </div>

        <div className="lg:col-span-7">
          <h2
            id="pains-title"
            className="text-[32px] leading-[1.06] tracking-[-0.03em] sm:text-[44px]"
          >
            Если сейчас так:
          </h2>
          <p className="mt-4 max-w-lg text-lg leading-8 text-muted">
            Это не слабость. Это больно — и с этим можно работать.
          </p>

          <ul className="mt-8 divide-y divide-line border-y border-line">
            {program.pains.map((pain) => (
              <li
                key={pain.label}
                className="grid gap-1 py-3.5 sm:grid-cols-12 sm:items-baseline sm:gap-6 sm:py-4"
              >
                <p className="text-lg leading-7 sm:col-span-9">{pain.text}</p>
                <p className="text-[13px] uppercase tracking-[0.12em] text-muted sm:col-span-3 sm:text-right">
                  {pain.label}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <Link
              href={ROUTES.onboarding}
              className={buttonStyles({ variant: "secondary", size: "md" })}
            >
              Это про меня — начать с первого дня
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
