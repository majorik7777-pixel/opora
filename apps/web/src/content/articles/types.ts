/** Блоки статьи: структурный контент вместо MDX — проще валидировать и переиспользовать. */
export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "quote"; text: string }
  | { type: "note"; title: string; text: string };

export interface ArticleFaqItem {
  question: string;
  answer: string;
}

export interface Article {
  slug: string;
  /** Кластер = тема, под которую собирается SEO-спрос (расставание, тревога, выгорание). */
  cluster: string;
  clusterTitle: string;
  title: string;
  /** Для meta description и карточки: 120–160 знаков. */
  description: string;
  lead: string;
  publishedAt: string;
  updatedAt?: string;
  readingMinutes: number;
  /** Программа, на которую ведёт CTA в конце статьи. */
  relatedProgramSlug: string;
  blocks: ArticleBlock[];
  faq?: ArticleFaqItem[];
}
