/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { publicApi } from "@/lib/api/public-api";
import { HttpError } from "@/lib/api/http";
import type { BlogPostDetail, ProductDetail, ProductListItem } from "@/lib/api/types";
import { getPrimaryProductImage, toAbsoluteUrl } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

type RelatedProduct = {
  postProductId: string;
  productId: string;
  product: ProductDetail | ProductListItem | null;
  position: number | null;
};

const getPostTitle = (post: BlogPostDetail) => post.seoTitle || post.seo_title || post.title || "Blog";
const getPostDescription = (post: BlogPostDetail) =>
  post.seoDescription || post.seo_description || post.shortDescription || post.short_description || "";
const getPostImage = (post: BlogPostDetail) => post.thumbnailUrl || post.thumbnail_url || "";
const getPostContent = (post: BlogPostDetail) => post.content || "";
const getPostType = (post: BlogPostDetail) => String(post.type || "blog").toUpperCase();

const formatDate = (value?: string | null) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const resolveRelatedProducts = async (post: BlogPostDetail): Promise<RelatedProduct[]> => {
  const source = [
    ...(Array.isArray(post.postProducts) ? post.postProducts : []),
    ...(Array.isArray(post.products) ? post.products : []),
  ];

  const seen = new Set<string>();
  const mapped = await Promise.all(
    source.map(async (item) => {
      const product = (item?.product ?? null) as ProductDetail | ProductListItem | null;
      const productId = String(item?.productId ?? item?.product_id ?? product?.id ?? "").trim();
      if (!productId) {
        return null;
      }

      let resolvedProduct = product;
      if (!resolvedProduct) {
        try {
          resolvedProduct = await publicApi.getProductById(productId);
        } catch {
          resolvedProduct = null;
        }
      }

      const postProductId = String(item?.postProductId ?? item?.post_product_id ?? item?.id ?? "").trim();
      const positionValue = item?.position ?? item?.sortOrder ?? item?.sort_order ?? null;
      const position = positionValue === null || positionValue === undefined ? null : Number(positionValue);
      const key = `${postProductId}::${productId}`;

      if (seen.has(key)) {
        return null;
      }
      seen.add(key);

      return {
        postProductId,
        productId,
        product: resolvedProduct,
        position: Number.isFinite(position) ? position : null,
      } satisfies RelatedProduct;
    })
  );

  return mapped
    .filter((item): item is RelatedProduct => Boolean(item))
    .sort((left, right) => {
      const leftPosition = left.position;
      const rightPosition = right.position;

      if (leftPosition === null && rightPosition === null) {
        return 0;
      }
      if (leftPosition === null) {
        return 1;
      }
      if (rightPosition === null) {
        return -1;
      }

      return leftPosition - rightPosition;
    });
};

const getProductName = (product: ProductDetail | ProductListItem | null) => product?.name || product?.title || "Sản phẩm";
const getProductImage = (product: ProductDetail | ProductListItem | null) =>
  product?.imageUrl || product?.image_url || getPrimaryProductImage((product as ProductDetail | null)?.images)?.image_url || "";
const getProductPrice = (product: ProductDetail | ProductListItem | null) =>
  product?.salePrice ?? product?.sale_price ?? product?.price_reference ?? product?.originalPrice ?? product?.original_price ?? "";
const getProductOldPrice = (product: ProductDetail | ProductListItem | null) => product?.originalPrice ?? product?.original_price ?? "";
const formatMoney = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const numericValue = typeof value === "number" ? value : Number(String(value).replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  return new Intl.NumberFormat("vi-VN").format(numericValue);
};
const getProductDiscountPercent = (product: ProductDetail | ProductListItem | null) => {
  const oldPrice = Number(getProductOldPrice(product));
  const salePrice = Number(getProductPrice(product));

  if (!Number.isFinite(oldPrice) || !Number.isFinite(salePrice) || oldPrice <= 0 || salePrice <= 0 || salePrice >= oldPrice) {
    return null;
  }

  return Math.round((1 - salePrice / oldPrice) * 100);
};
const getProductLink = (product: ProductDetail | ProductListItem | null) => {
  if (!product) {
    return "";
  }

  return `/product/${product.slug || product.id}`;
};

const getProductAffiliateUrl = (product: ProductDetail | ProductListItem | null) => {
  if (!product) {
    return "";
  }

  if (product.affiliateLink) {
    return product.affiliateLink;
  }

  const affiliateLinks = (product as ProductDetail).affiliate_links;
  const firstAffiliate = Array.isArray(affiliateLinks) ? affiliateLinks[0] : null;
  return firstAffiliate?.affiliate_url || "";
};

const toHtml = (content: string) => content || "<p>Nội dung đang được cập nhật.</p>";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await publicApi.getPostBySlug(slug);
    const title = getPostTitle(post);
    const description = getPostDescription(post);
    const image = getPostImage(post);

    return {
      title,
      description,
      alternates: {
        canonical: `/blog/${post.slug}`,
      },
      openGraph: {
        title,
        description,
        url: toAbsoluteUrl(`/blog/${post.slug}`),
        type: "article",
        images: image ? [image] : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch {
    return {
      title: "Không tìm thấy bài viết",
    };
  }
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  let post: BlogPostDetail;

  try {
    post = await publicApi.getPostBySlug(slug);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return notFound();
    }

    return notFound();
  }

  const title = getPostTitle(post);
  const description = getPostDescription(post);
  const image = getPostImage(post);
  const content = getPostContent(post);
  const relatedProducts = await resolveRelatedProducts(post);
  const publishedDate = formatDate(post.publishedAt || post.published_at || post.createdAt || post.created_at);

  return (
    <main className="min-h-screen bg-white py-6 sm:py-8 lg:py-10">
      <article className="mx-auto max-w-4xl px-4 sm:px-6">
        <header className="border-b border-slate-200 pb-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link href="/blog" className="underline decoration-slate-300 underline-offset-4 hover:text-slate-700">
              Blog
            </Link>
            <span>/</span>
            <span>{getPostType(post)}</span>
          </div>

          <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            {title}
          </h1>

          {description ? <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">{description}</p> : null}

        </header>

        {image ? (
          <div className="mt-6 mx-auto max-w-3xl overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100">
            <img
              src={image}
              alt={title}
              className="h-[240px] w-full object-cover sm:h-[320px] lg:h-[400px]"
            />
          </div>
        ) : null}

        <section className="prose prose-slate mt-8 max-w-none prose-headings:font-black prose-h2:mt-10 prose-h2:text-3xl prose-p:leading-8 prose-img:mx-auto prose-img:max-h-[420px] prose-img:w-auto prose-img:max-w-full prose-img:rounded-2xl">
          <div dangerouslySetInnerHTML={{ __html: toHtml(content) }} />
        </section>

        {relatedProducts.length > 0 ? (
          <section className="mt-12 border-t border-slate-200 pt-8">
            <div className="mt-5 grid gap-5">
              {relatedProducts.map((item) => {
                const product = item.product;
                const productImage = getProductImage(product);
                const productTitle = getProductName(product);
                const productPrice = getProductPrice(product);
                const oldPrice = getProductOldPrice(product);
                const discountPercent = getProductDiscountPercent(product);
                const link = getProductLink(product);
                const buyUrl = getProductAffiliateUrl(product) || link;

                return (
                  <article
                    key={`${item.postProductId}-${item.productId}`}
                    className="grid overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)] md:grid-cols-2"
                  >
                    <div className="bg-slate-100 md:min-h-[360px]">
                      {productImage ? (
                        <img src={productImage} alt={productTitle} className="h-full w-full object-contain p-4 md:p-6" />
                      ) : (
                        <div className="flex min-h-[260px] items-center justify-center bg-slate-100 text-xs uppercase tracking-[0.18em] text-slate-400 md:min-h-[360px]">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="flex h-full flex-col justify-center gap-5 p-5 md:p-7 lg:p-8">
                      <div className="space-y-4">
                        <h3 className="text-3xl font-black leading-tight text-slate-950 md:text-4xl">
                          {productTitle}
                        </h3>

                        {product?.shortDescription || product?.short_description ? (
                          <p className="max-w-2xl text-base leading-7 text-slate-600">
                            {product.shortDescription || product.short_description}
                          </p>
                        ) : null}

                        {discountPercent ? (
                          <span className="inline-flex rounded-lg bg-emerald-100 px-3 py-1.5 text-base font-semibold text-emerald-700">
                            Now {discountPercent}% Off
                          </span>
                        ) : null}
                      </div>

                      <div className="grid grid-cols-[minmax(0,1fr)_160px] overflow-hidden rounded-2xl border border-[#2f36b9]">
                        <div className="flex min-w-0 items-center justify-center gap-2 whitespace-nowrap bg-white px-4 py-3 text-sm font-black text-slate-900 sm:text-base">
                          {oldPrice ? <span className="text-slate-400 line-through">{formatMoney(oldPrice)} đ</span> : null}
                          {productPrice ? <span className="text-slate-900">{formatMoney(productPrice)} đ</span> : null}
                        </div>

                        {buyUrl ? (
                          <a
                            href={buyUrl}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="inline-flex items-center justify-center bg-[#2f36b9] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:brightness-95 sm:text-base"
                          >
                            Mua ngay
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}
      </article>
    </main>
  );
}
