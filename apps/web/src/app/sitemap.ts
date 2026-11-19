import type { MetadataRoute } from "next";

const BASE_URL = process.env.APP_URL ?? "https://opora.ru";

/** Пока в sitemap только реальные публичные страницы; SEO-кластер статей добавится в T-301. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${BASE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/legal/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/legal/consent`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/legal/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/legal/offer`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
