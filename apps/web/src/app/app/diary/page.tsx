import type { Metadata } from "next";
import { Card, Container, Disclaimer } from "@opora/ui";

export const metadata: Metadata = {
  title: "Дневник",
  robots: { index: false, follow: false },
};

const plannedFeatures = [
  "Настроение по шкале 1–10 и теги",
  "Запись текстом или голосом",
  "AI-разбор: что заметно и что помогло",
  "История, поиск и экспорт",
];

export default function DiaryPage() {
  return (
    <Container size="narrow" className="py-8 sm:py-10">
      <p className="text-sm font-medium uppercase tracking-wide text-muted">
        Дневник · каркас Phase 0–1
      </p>
      <h1 className="mt-1 font-display text-3xl leading-tight text-ink sm:text-4xl">
        Дневник
      </h1>
      <p className="mt-3 text-base leading-7 text-muted">
        Короткие записи помогают заметить, что с тобой происходит, — без оценок
        и «правильных» ответов.
      </p>

      <Card className="mt-6 space-y-4">
        <div className="rounded-field border border-dashed border-line bg-bg p-6 text-center">
          <p className="text-base font-medium text-ink">Пока здесь тихо</p>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted">
            Первая запись появится, когда мы откроем дневник. Настроение, текст,
            голос — всё будет храниться зашифрованным и только для тебя.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
            Что будет внутри
          </h2>
          <ul className="mt-2 space-y-2">
            {plannedFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm leading-6 text-ink/90">
                <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-sage" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <div className="mt-8 space-y-2">
        <Disclaimer>
          Записи дневника могут содержать сведения о твоём состоянии — это
          специальная категория персональных данных. Мы храним их в России,
          шифруем и не передаём рекламодателям.
        </Disclaimer>
        <Disclaimer>
          Дневник не заменяет консультацию специалиста. Если нужна помощь —
          напиши нам, подскажем, куда обратиться.
        </Disclaimer>
      </div>
    </Container>
  );
}
