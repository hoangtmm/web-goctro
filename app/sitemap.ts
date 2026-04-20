import type { MetadataRoute } from "next";
import { publicApi } from "@/lib/api/public-api";
import { getSiteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  let productUrls: MetadataRoute.Sitemap = [];
  let blogUrls: MetadataRoute.Sitemap = [];

  try {
    const products = await publicApi.getProducts();
    productUrls = products.map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    productUrls = [];
  }

  try {
    const posts = await publicApi.getPosts();
    blogUrls = posts
      .filter((post) => Boolean(post.slug))
      .map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
  } catch {
    blogUrls = [];
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/product`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/danh-muc`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...productUrls,
    ...blogUrls,
  ];
}