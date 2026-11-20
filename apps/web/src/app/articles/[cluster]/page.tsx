import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@opora/ui";

import { getCluster, listArticlesByCluster } from "@/content/articles";
import { ArticleCard } from "@/components/articles/article-card";
import { LandingHeader } from "@/components/landing/landing-header";
import { SiteFooter } from "@/components/site-footer";

const BASE_URL = process.env.APP_URL ?? "https://opora-psihologii.ru";

type Params = { params: Promise<{ cluster: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { cluster: slug } = await params;
  const cluster = getCluster(slug);
  if (!cluster) return { title: "Кластер не найден — «Опора»", robots: { index: false } };

  return {
    metadataBase: new URL(BASE_URL),
    title: `${cluster.title} — статьи «Опоры»`,
    description: `Тексты по теме «${cluster.title}»: что происходит и что можно сделать. Без обещаний и диагнозов.`,
    alternates: { canonical: `/articles/${slug}` },
  };
}

export default async function ClusterPage({ params }: Params) {
  const { cluster: slug } = await params;
  const cluster = getCluster(slug);
  if (!cluster) notFound();

  const clusterArticles = listArticlesByCluster(slug);

  return (
    <div className="flex min-h-dvh flex-col">
      <LandingHeader />
      <main id="main" className="flex-1">
        <Container size="prose" className="py-14 sm:py-20">
          <nav aria-label="Хлебные крошки" className="text-sm text-muted">
            <Link href="/articles" className="hover:text-ink">
              Статьи
            </Link>
            <span className="mx-2">/</span>
            <span className="text-ink">{cluster.title}</span>
          </nav>

          <h1 className="mt-6 text-[38px] leading-[1.06] tracking-[-0.03em] sm:text-[52px]">
            {cluster.title}
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-7 text-muted">
            {cluster.count} {cluster.count === 1 ? "текст" : "текста"} о том, что
            помогает пережить это время.
          </p>

          <div className="mt-10">
            {clusterArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
