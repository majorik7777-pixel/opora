import type { MetadataRoute } from "next";

import { programContentBySlug } from "@/content/programs";

const BASE_URL = process.env.APP_URL ?? "https://opora-psihologii.ru";

/**
 * В sitemap только реальные публичные страницы. Программы берутся из реестра
 * контента (он же определяет доступность страницы); хаб `/programs` подключим
 * вместе со второй программой — до этого он не нужен поисковику.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const programs = Object.keys(programContentBySlug).map((slug) => ({
    url: `${BASE_URL}/programs/${slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  return [
    { url: `${BASE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    ...programs,
    { url: `${BASE_URL}/legal/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/legal/consent`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/legal/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/legal/offer`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
