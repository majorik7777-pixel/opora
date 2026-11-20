import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@opora/ui";

import { articles, listClusters } from "@/content/articles";
import { ArticleCard } from "@/components/articles/article-card";
import { LandingHeader } from "@/components/landing/landing-header";
import { SiteFooter } from "@/components/site-footer";

const BASE_URL = process.env.APP_URL ?? "https://opora-psihologii.ru";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Статьи — «Опора»",
  description:
    "Короткие тексты о том, как пережить расставание: что происходит с телом, как не проверять соцсети, что делать в первую неделю.",
  alternates: { canonical: "/articles" },
};

export default function ArticlesPage() {
  const clusters = listClusters();

  return (
    <div className="flex min-h-dvh flex-col">
      <LandingHeader />
      <main id="main" className="flex-1">
        <Container size="prose" className="py-14 sm:py-20">
          <h1 className="text-[38px] leading-[1.06] tracking-[-0.03em] sm:text-[52px]">
            Статьи
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-7 text-muted">
            Без обещаний и диагнозов: что происходит и что можно сделать. Тексты
            дополняют программу, но не заменяют помощь специалиста.
          </p>

          <div className="mt-12 space-y-12">
            {clusters.map((cluster) => {
              const clusterArticles = articles.filter(
                (article) => article.cluster === cluster.slug,
              );
              return (
                <section key={cluster.slug}>
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 className="text-2xl font-medium tracking-[-0.02em]">
                      {cluster.title}
                    </h2>
                    <Link
                      href={`/articles/${cluster.slug}`}
                      className="text-sm text-accent-deep underline underline-offset-4"
                    >
                      Все {cluster.count}
                    </Link>
                  </div>
                  <div className="mt-5">
                    {clusterArticles.map((article) => (
                      <ArticleCard key={article.slug} article={article} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
