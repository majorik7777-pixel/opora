import Link from "next/link";
import type { Article } from "@/content/articles/types";

/** Тело статьи: блоки из контента, без MDX и без dangerouslySetInnerHTML. */
export function ArticleBody({ article }: { article: Article }) {
  return (
    <div className="mt-8">
      {article.blocks.map((block, index) => {
        switch (block.type) {
          case "h2":
            return (
              <h2
                key={index}
                className="mt-10 text-2xl font-medium leading-tight tracking-[-0.02em] sm:text-[28px]"
              >
                {block.text}
              </h2>
            );
          case "p":
            return (
              <p key={index} className="mt-4 text-[17px] leading-8 text-ink/90">
                {block.text}
              </p>
            );
          case "list": {
            const Tag = block.ordered ? "ol" : "ul";
            return (
              <Tag
                key={index}
                className={`mt-4 space-y-3 pl-5 text-[17px] leading-8 text-ink/90 ${
                  block.ordered ? "list-decimal" : "list-disc"
                }`}
              >
                {block.items.map((item) => (
                  <li key={item} className="pl-1">
                    {item}
                  </li>
                ))}
              </Tag>
            );
          }
          case "quote":
            return (
              <blockquote
                key={index}
                className="mt-6 border-l-2 border-accent pl-5 font-display text-xl italic leading-8 text-ink/90"
              >
                {block.text}
              </blockquote>
            );
          case "note":
            return (
              <aside
                key={index}
                className="mt-8 rounded-card border border-line bg-surface p-5"
              >
                <p className="text-sm font-medium text-ink">{block.title}</p>
                <p className="mt-2 text-[15px] leading-6 text-muted">{block.text}</p>
              </aside>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

export function ArticleCta({
  programSlug,
  programName,
}: {
  programSlug: string;
  programName: string;
}) {
  return (
    <aside className="mt-12 rounded-card border border-line bg-accent-soft/60 p-6">
      <p className="text-xl font-medium tracking-[-0.02em]">Хочешь не только читать?</p>
      <p className="mt-2 text-[15px] leading-6 text-muted">
        {programName}: семь дней по десять минут. Короткий урок, практика и дневник
        с бережным разбором. Первый день — бесплатно, карта не нужна.
      </p>
      <Link
        href={`/programs/${programSlug}`}
        className="mt-5 inline-flex min-h-12 items-center rounded-button bg-ink px-6 text-[15px] font-medium text-paper hover:bg-ink/90"
      >
        Посмотреть программу
      </Link>
    </aside>
  );
}
