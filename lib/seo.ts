import type { ProductDetail, ProductImage } from "@/lib/api/types";

const FALLBACK_SITE_URL = "https://goctrotoiuu.vn";

export function getSiteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    FALLBACK_SITE_URL;

  const normalized = raw.trim().replace(/\/$/, "");

  try {
    return new URL(normalized).toString().replace(/\/$/, "");
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export function toAbsoluteUrl(path: string) {
  const siteUrl = getSiteUrl();
  const sanitizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${sanitizedPath}`;
}

export function buildOrganizationJsonLd() {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Góc Trọ Tối Ưu",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
  };
}

export function buildWebsiteJsonLd() {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Góc Trọ Tối Ưu",
    url: siteUrl,
    inLanguage: "vi-VN",
  };
}

function normalizeProductImages(images: ProductImage[] | unknown) {
  return Array.isArray(images) ? images : [];
}

export function sortProductImages(images: ProductImage[] | unknown) {
  return [...normalizeProductImages(images)].sort((left, right) => {
    const coverScore = Number(right.is_cover) - Number(left.is_cover);
    if (coverScore !== 0) {
      return coverScore;
    }

    const orderScore = left.sort_order - right.sort_order;
    if (orderScore !== 0) {
      return orderScore;
    }

    return left.id.localeCompare(right.id);
  });
}

export function getPrimaryProductImage(images: ProductImage[] | unknown) {
  return sortProductImages(images)[0] ?? null;
}

export function buildProductReviewJsonLd(product: ProductDetail) {
  const productUrl = toAbsoluteUrl(`/blog/${product.slug}`);
  const imageUrl = getPrimaryProductImage(product.images)?.image_url || undefined;
  const description = product.short_description || product.shortDescription || product.content || product.description || "";
  const priceValue = product.salePrice ?? product.price_reference ?? product.originalPrice ?? null;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title || product.name,
    description,
    image: imageUrl ? [imageUrl] : undefined,
    brand: product.brand
      ? {
          "@type": "Brand",
          name: product.brand,
        }
      : undefined,
    sku: product.model || undefined,
    offers:
      priceValue && product.currency
        ? {
            "@type": "Offer",
            price: String(priceValue),
            priceCurrency: product.currency,
            url: productUrl,
            availability: "https://schema.org/InStock",
          }
        : undefined,
    aggregateRating:
      product.review_score !== null && product.review_score !== undefined
        ? {
            "@type": "AggregateRating",
            ratingValue: product.review_score,
            reviewCount: 1,
            bestRating: 10,
            worstRating: 0,
          }
        : undefined,
  };
}
