import type { Article } from "./types";
import { firstWeek } from "./rasstavanie/first-week";
import { stopCheckingSocial } from "./rasstavanie/stop-checking-social";
import { whyBodyHurts } from "./rasstavanie/why-body-hurts";

/**
 * Реестр SEO-статей (И-8). Одна статья = файл + запись в массиве; маршруты,
 * sitemap и перелинковка собираются из этих данных, руками страницы не пишутся.
 * Кластер держит тему, статья внутри кластера ведёт на программу через
 * `relatedProgramSlug`.
 */
export const articles: readonly Article[] = [
  whyBodyHurts,
  stopCheckingSocial,
  firstWeek,
];

export interface ArticleCluster {
  slug: string;
  title: string;
  count: number;
}

export function listClusters(): ArticleCluster[] {
  const map = new Map<string, ArticleCluster>();
  for (const article of articles) {
    const current = map.get(article.cluster);
    if (current) {
      current.count += 1;
    } else {
      map.set(article.cluster, {
        slug: article.cluster,
        title: article.clusterTitle,
        count: 1,
      });
    }
  }
  return [...map.values()].sort((a, b) => a.title.localeCompare(b.title, "ru"));
}

export function getCluster(slug: string): ArticleCluster | null {
  return listClusters().find((cluster) => cluster.slug === slug) ?? null;
}

export function listArticlesByCluster(cluster: string): Article[] {
  return articles
    .filter((article) => article.cluster === cluster)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getArticle(cluster: string, slug: string): Article | null {
  return (
    articles.find(
      (article) => article.cluster === cluster && article.slug === slug,
    ) ?? null
  );
}

export function getRelatedArticles(article: Article, limit = 2): Article[] {
  return articles
    .filter(
      (candidate) =>
        candidate.cluster === article.cluster && candidate.slug !== article.slug,
    )
    .slice(0, limit);
}
