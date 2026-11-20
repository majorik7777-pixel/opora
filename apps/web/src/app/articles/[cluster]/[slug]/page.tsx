import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@opora/ui";

import { getProgramContent } from "@/content/programs";
import {
  getArticle,
  getCluster,
  getRelatedArticles,
} from "@/content/articles";
import { ArticleBody, ArticleCta } from "@/components/articles/article-body";
import { ArticleCard } from "@/components/articles/article-card";
import { LandingHeader } from "@/components/landing/landing-header";
import { SiteFooter } from "@/components/site-footer";

const BASE_URL = process.env.APP_URL ?? "https://opora-psihologii.ru";

type Params = { params: Promise<{ cluster: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { cluster, slug } = await params;
  const article = getArticle(cluster, slug);
  if (!article) return { title: "Статья не найдена — «Опора»", robots: { index: false } };

  const url = `/articles/${cluster}/${slug}`;
  return {
    metadataBase: new URL(BASE_URL),
    title: `${article.title} — «Опора»`,
    description: article.description,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `${BASE_URL}${url}`,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt ?? article.publishedAt,
      locale: "ru_RU",
    },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { cluster: clusterSlug, slug } = await params;
  const article = getArticle(clusterSlug, slug);
  const cluster = getCluster(clusterSlug);
  if (!article || !cluster) notFound();

  const program = getProgramContent(article.relatedProgramSlug);
  const related = getRelatedArticles(article);
  const url = `${BASE_URL}/articles/${clusterSlug}/${slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    inLanguage: "ru-RU",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Organization", name: "Опора" },
    publisher: { "@type": "Organization", name: "Опора", url: BASE_URL },
  };

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: BASE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Статьи",
        item: `${BASE_URL}/articles`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: cluster.title,
        item: `${BASE_URL}/articles/${clusterSlug}`,
      },
      { "@type": "ListItem", position: 4, name: article.title, item: url },
    ],
  };

  const faqJsonLd =
    article.faq && article.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: article.faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }
      : null;

  return (
    <div className="flex min-h-dvh flex-col">
      <LandingHeader />
      <main id="main" className="flex-1">
        <Container size="prose" className="py-12 sm:py-16">
          <nav aria-label="Хлебные крошки" className="text-sm text-muted">
            <Link href="/articles" className="hover:text-ink">
              Статьи
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/articles/${clusterSlug}`} className="hover:text-ink">
              {cluster.title}
            </Link>
          </nav>

          <article className="mt-6">
            <p className="text-xs uppercase tracking-[0.12em] text-muted">
              {article.readingMinutes} мин чтения
            </p>
            <h1 className="mt-3 text-[34px] leading-[1.08] tracking-[-0.03em] sm:text-[46px]">
              {article.title}
            </h1>
            <p className="mt-5 text-lg leading-7 text-muted">{article.lead}</p>

            <ArticleBody article={article} />

            {article.faq && article.faq.length > 0 ? (
              <section className="mt-12 border-t border-line pt-8">
                <h2 className="text-2xl font-medium tracking-[-0.02em]">Частые вопросы</h2>
                <dl className="mt-5 space-y-5">
                  {article.faq.map((item) => (
                    <div key={item.question}>
                      <dt className="text-[17px] font-medium">{item.question}</dt>
                      <dd className="mt-1 text-[15px] leading-6 text-muted">{item.answer}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}

            {program ? (
              <ArticleCta programSlug={program.slug} programName={program.name} />
            ) : null}

            <p className="mt-8 text-[13px] leading-5 text-muted">
              «Опора» — инструмент психологической самопомощи. Материал не является
              медицинской рекомендацией и не заменяет консультацию специалиста. 18+.
            </p>
          </article>

          {related.length > 0 ? (
            <section className="mt-12 border-t border-line pt-8">
              <h2 className="text-xl font-medium tracking-[-0.02em]">Читать дальше</h2>
              <div className="mt-4">
                {related.map((item) => (
                  <ArticleCard key={item.slug} article={item} />
                ))}
              </div>
            </section>
          ) : null}
        </Container>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}
    </div>
  );
}
