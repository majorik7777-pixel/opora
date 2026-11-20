import Link from "next/link";
import type { Article } from "@/content/articles/types";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="border-t border-line py-6 first:border-t-0 first:pt-0">
      <Link href={`/articles/${article.cluster}/${article.slug}`} className="group block">
        <p className="text-xs uppercase tracking-[0.12em] text-muted">
          {article.clusterTitle} · {article.readingMinutes} мин
        </p>
        <h3 className="mt-2 text-xl font-medium leading-snug tracking-[-0.02em] group-hover:text-accent-deep sm:text-[22px]">
          {article.title}
        </h3>
        <p className="mt-2 text-[15px] leading-6 text-muted">{article.description}</p>
      </Link>
    </article>
  );
}
