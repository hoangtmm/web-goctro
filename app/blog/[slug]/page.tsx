/* eslint-disable @next/next/no-img-element */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { publicApi } from "@/lib/api/public-api";
import { HttpError } from "@/lib/api/http";
import { buildProductReviewJsonLd, getPrimaryProductImage, sortProductImages, toAbsoluteUrl } from "@/lib/seo";
import ScrollToTop from "@/components/ScrollToTop";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

function isNumericId(value: string) {
  return /^\d+$/.test(value.trim());
}

async function resolveProduct(identifier: string) {
  if (isNumericId(identifier)) {
    try {
      return await publicApi.getProductById(identifier);
    } catch (error) {
      if (error instanceof HttpError && error.status !== 404) {
        throw error;
      }
    }
  }

  try {
    return await publicApi.getProductBySlug(identifier);
  } catch (error) {
    if (!(error instanceof HttpError) || error.status !== 404) {
      throw error;
    }

    const products = await publicApi.getProducts();
    const matched = products.find((item) => item.slug === identifier || String(item.id) === identifier);

    if (!matched) {
      throw error;
    }

    return publicApi.getProductById(matched.id);
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let product = null;

  try {
    product = await resolveProduct(slug);
  } catch {
    product = null;
  }

  if (!product) {
    return {
      title: "Không tìm thấy sản phẩm",
    };
  }

  const displayTitle = product.title || product.name || "Chi tiết sản phẩm";
  const displayDescription =
    product.short_description || product.shortDescription || product.description || "Chi tiết sản phẩm";

  return {
    title: displayTitle,
    description: displayDescription,
    alternates: {
      canonical: `/blog/${product.slug}`,
    },
    openGraph: {
      title: displayTitle,
      description: displayDescription,
      url: toAbsoluteUrl(`/blog/${product.slug}`),
      type: "article",
      images: product.imageUrl ? [product.imageUrl] : product.images?.[0]?.image_url ? [product.images[0].image_url] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: displayTitle,
      description: displayDescription,
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  let product;

  try {
    product = await resolveProduct(slug);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return notFound();
    }
    throw error;
  }

  if (!product) return notFound();

  const displayTitle = product.title || product.name || "Chi tiết sản phẩm";
  const displayDescription =
    product.short_description || product.shortDescription || product.description || "Chưa có mô tả ngắn.";

  const normalizedImages = Array.isArray(product.images) ? product.images : [];
  const sortedImages = sortProductImages(normalizedImages);
  const coverImage = getPrimaryProductImage(normalizedImages);
  const galleryImages = sortedImages.filter((image) => image.id !== coverImage?.id);
  const activeAffiliateLinks = (product.affiliate_links ?? [])
    .filter((link) => link.is_active)
    .sort((left, right) => Number(right.is_primary) - Number(left.is_primary));

  const shopeeLink = activeAffiliateLinks.find((link) => link.platform === "shopee") ?? null;
  const tiktokLink = activeAffiliateLinks.find((link) => link.platform === "tiktok_shop") ?? null;
  const fallbackAffiliateUrl = product.affiliateLink?.trim() || null;

  const coverUrl =
    coverImage?.thumbnail_url ||
    coverImage?.image_url ||
    product.imageUrl ||
    null;

  const isActive = product.isActive ?? product.is_active ?? null;
  const isFeatured = product.isFeatured ?? product.is_featured ?? null;
  const isRecommended = product.isRecommended ?? null;

  const toNumericValue = (value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    if (typeof value === "number") {
      return Number.isFinite(value) ? value : null;
    }

    const normalized = value.replace(/[^\d.-]/g, "");
    const numericValue = Number(normalized);
    return Number.isFinite(numericValue) ? numericValue : null;
  };

  const formatMoney = (value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    const numericValue = typeof value === "number" ? value : Number(value);
    return Number.isFinite(numericValue) ? numericValue.toLocaleString("vi-VN") : String(value);
  };

  const salePriceRaw = product.salePrice ?? product.sale_price ?? product.price_reference;
  const originalPriceRaw = product.originalPrice ?? product.original_price;

  const salePriceNumber = toNumericValue(salePriceRaw);
  const originalPriceNumber = toNumericValue(originalPriceRaw);

  const salePrice = formatMoney(salePriceRaw);
  const originalPrice = formatMoney(product.originalPrice);

  const hasDiscount =
    originalPriceNumber !== null &&
    salePriceNumber !== null &&
    originalPriceNumber > salePriceNumber;
  const discountPercent = hasDiscount
    ? Math.round(((originalPriceNumber - salePriceNumber) / originalPriceNumber) * 100)
    : null;

  const primaryAffiliateLink = shopeeLink ?? tiktokLink;
  const primaryAffiliateHref = primaryAffiliateLink
    ? publicApi.getAffiliateRedirectUrl(primaryAffiliateLink.id)
    : fallbackAffiliateUrl;
  const primaryAffiliateLabel = primaryAffiliateLink
    ? primaryAffiliateLink.platform === "shopee"
      ? "SHOPEE"
      : "TIKTOK"
    : "MUA NGAY";

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-5 sm:py-8 lg:py-12">
      <ScrollToTop />
      <article className="space-y-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildProductReviewJsonLd(product)),
          }}
        />

        <section className="grid items-start gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm sm:rounded-[2rem]">
            <div className="relative aspect-[4/3] bg-slate-100 lg:aspect-[4/3]">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={coverImage?.alt_text || product.title}
                  className="h-full w-full object-contain object-center"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-200 via-white to-slate-100 text-sm uppercase tracking-[0.2em] text-slate-500">
                  No cover image
                </div>
              )}
            </div>

            {galleryImages.length > 0 ? (
              <div className="grid gap-3 border-t border-slate-200 bg-slate-50 p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-3">
                {galleryImages.slice(0, 6).map((image) => (
                  <img
                    key={image.id}
                    src={image.thumbnail_url || image.image_url}
                    alt={image.alt_text || product.title}
                    className="h-28 w-full rounded-2xl object-cover sm:h-32 lg:h-36"
                  />
                ))}
              </div>
            ) : null}
          </div>

          <aside className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-5 lg:p-6">
            <h1 className="text-2xl font-black leading-tight text-slate-950 sm:text-3xl lg:text-4xl">
              {displayTitle}
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
              {displayDescription}
            </p>

            {discountPercent ? (
              <p className="mt-5 inline-flex rounded-md bg-emerald-100 px-3 py-1 text-lg font-semibold text-emerald-700 sm:text-2xl">
                Now {discountPercent}% Off
              </p>
            ) : null}

            <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap">
              <div className="inline-flex overflow-hidden rounded-md border border-[#2523a6] bg-white text-[#111827]">
                <div className="px-3 py-3 text-base font-black sm:px-4 sm:text-lg">
                  {hasDiscount ? (
                    <>
                      <span className="mr-2 text-xs font-bold text-slate-500 line-through sm:text-sm">
                        {originalPriceNumber?.toLocaleString("vi-VN")} đ
                      </span>
                      <span>{salePriceNumber?.toLocaleString("vi-VN")} đ</span>
                    </>
                  ) : (
                    <span>{salePrice || originalPrice ? `${salePrice ?? originalPrice} đ` : "-"}</span>
                  )}
                </div>
                {primaryAffiliateHref ? (
                  <a
                    href={primaryAffiliateHref}
                    rel="sponsored"
                    target="_blank"
                    className="inline-flex min-h-12 items-center justify-center bg-[#2523a6] px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-[#1f1d89] sm:px-6 sm:text-base"
                  >
                    {primaryAffiliateLabel}
                  </a>
                ) : null}
              </div>
            </div>

          </aside>
        </section>

      </article>
    </main>
  );
}