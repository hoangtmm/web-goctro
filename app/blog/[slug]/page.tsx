/* eslint-disable @next/next/no-img-element */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { publicApi } from "@/lib/api/public-api";
import { HttpError } from "@/lib/api/http";
import { buildProductReviewJsonLd, getPrimaryProductImage, sortProductImages, toAbsoluteUrl } from "@/lib/seo";

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

  const formatMoney = (value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    const numericValue = typeof value === "number" ? value : Number(value);
    return Number.isFinite(numericValue) ? numericValue.toLocaleString("vi-VN") : String(value);
  };

  const salePrice = formatMoney(product.salePrice ?? product.price_reference);
  const originalPrice = formatMoney(product.originalPrice);
  const buildAffiliateButton = (
    label: string,
    linkId: string | number | null,
    tone: "shopee" | "tiktok",
    fallbackUrl?: string | null
  ) => {
    const href = linkId ? publicApi.getAffiliateRedirectUrl(linkId) : fallbackUrl;
    if (!href) return null;

    const className =
      tone === "shopee"
        ? "border-[#f97316] bg-[#f97316] text-white hover:bg-[#ea580c]"
        : "border-[#111827] bg-[#111827] text-white hover:bg-black";

    return (
      <a
        key={label}
        href={href}
        rel="sponsored"
        target="_blank"
        className={`inline-flex min-w-[170px] items-center justify-center rounded-xl border px-5 py-3 text-sm font-bold uppercase tracking-[0.1em] transition ${className}`}
      >
        {label}
      </a>
    );
  };

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10 lg:py-14">
      <article className="space-y-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildProductReviewJsonLd(product)),
          }}
        />

        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="relative aspect-[4/3] bg-slate-100 lg:aspect-[5/4]">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={coverImage?.alt_text || product.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-200 via-white to-slate-100 text-sm uppercase tracking-[0.2em] text-slate-500">
                  No cover image
                </div>
              )}
            </div>

            {galleryImages.length > 0 ? (
              <div className="grid gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-3">
                {galleryImages.slice(0, 6).map((image) => (
                  <img
                    key={image.id}
                    src={image.thumbnail_url || image.image_url}
                    alt={image.alt_text || product.title}
                    className="h-36 w-full rounded-2xl object-cover"
                  />
                ))}
              </div>
            ) : null}
          </div>

          <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-2">{product.category_name ?? "Sản phẩm"}</span>
              <span className="rounded-full bg-slate-100 px-3 py-2">{product.sourcePlatform || product.platform}</span>
              {isRecommended ? (
                <span className="rounded-full bg-amber-100 px-3 py-2 text-amber-700">Recommended</span>
              ) : null}
              {isFeatured ? (
                <span className="rounded-full bg-sky-100 px-3 py-2 text-sky-700">Featured</span>
              ) : null}
              {isActive === true ? (
                <span className="rounded-full bg-emerald-100 px-3 py-2 text-emerald-700">Active</span>
              ) : isActive === false ? (
                <span className="rounded-full bg-rose-100 px-3 py-2 text-rose-700">Inactive</span>
              ) : null}
            </div>

            <h1 className="mt-5 text-4xl font-black leading-tight text-slate-950 lg:text-5xl">
              {displayTitle}
            </h1>

            <p className="mt-4 text-lg leading-8 text-slate-600">
              {displayDescription}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-slate-700">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Giá sale</p>
                <p className="mt-1 text-lg font-bold text-slate-950">
                  {salePrice ? `${salePrice} đ` : "-"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Giá gốc</p>
                <p className="mt-1 text-lg font-bold text-slate-950">
                  {originalPrice ? `${originalPrice} đ` : "-"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Price reference</p>
                <p className="mt-1 text-lg font-bold text-slate-950">{product.price_reference || "-"}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Affiliate URL</p>
                <p className="mt-1 break-all text-sm font-semibold text-slate-950">
                  {fallbackAffiliateUrl || product.affiliateLink || "-"}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {shopeeLink || tiktokLink ? (
                <>
                  {buildAffiliateButton(
                    shopeeLink?.label || "Mua trên Shopee",
                    shopeeLink?.id ?? null,
                    "shopee"
                  )}
                  {buildAffiliateButton(
                    tiktokLink?.label || "Mua trên TikTok",
                    tiktokLink?.id ?? null,
                    "tiktok"
                  )}
                </>
              ) : fallbackAffiliateUrl ? (
                buildAffiliateButton("Mua ngay", null, "shopee", fallbackAffiliateUrl)
              ) : null}
            </div>

            {!shopeeLink && !tiktokLink && fallbackAffiliateUrl ? (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                BE chỉ trả 1 link affiliate cho sản phẩm này, nên FE sẽ hiển thị 1 nút mua tương ứng.
              </div>
            ) : null}

          </aside>
        </section>

      </article>
    </main>
  );
}