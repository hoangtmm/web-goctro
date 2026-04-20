import Link from "next/link";
import type { Metadata } from "next";
import { publicApi } from "@/lib/api/public-api";
import { mapHttpErrorMessage } from "@/lib/api/error-messages";
import type { ProductListItem, ProductRecommendation } from "@/lib/api/types";
import { buildOrganizationJsonLd, buildWebsiteJsonLd, toAbsoluteUrl } from "@/lib/seo";

type HomePageProps = {
  searchParams: Promise<{
    recPage?: string | string[];
    productPage?: string | string[];
  }>;
};

const ITEMS_PER_PAGE = 4;

const getProductName = (product: ProductListItem) => product.name || product.title;
const getProductShortDescription = (product: ProductListItem) =>
  product.shortDescription || product.short_description || "Chưa có mô tả";
const getProductImage = (product: ProductListItem) => product.imageUrl || product.image_url;
const getProductPlatform = (product: ProductListItem) =>
  String(product.sourcePlatform || product.platform || "").toLowerCase();
const getBuyButtonClassName = (product: ProductListItem) =>
  getProductPlatform(product).includes("tiktok")
    ? "mt-4 !inline-flex w-fit self-start rounded-lg bg-black px-3 py-1.5 text-sm font-semibold text-[#0f2f78] transition hover:brightness-95"
    : "mt-4 !inline-flex w-fit self-start rounded-lg bg-[#fb8a5a] px-3 py-1.5 text-sm font-semibold text-[#0f2f78] transition hover:brightness-95";

const formatMoney = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = typeof value === "number" ? value : Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(numericValue) ? numericValue.toLocaleString("vi-VN") : String(value);
};

export const metadata: Metadata = {
  title: "TapHoaDeal",
  description:
    "Trang tổng hợp review sản phẩm phòng trọ, góc học tập và đồ gia dụng nhỏ gọn với nội dung rõ ràng, dễ chọn mua.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TapHoaDeal",
    description:
      "Trang tổng hợp review sản phẩm phòng trọ, góc học tập và đồ gia dụng nhỏ gọn với nội dung rõ ràng, dễ chọn mua.",
    url: toAbsoluteUrl("/"),
    type: "website",
  },
};

const toPositivePage = (value?: string | string[]) => {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
};

const buildPageHref = (recPage: number, productPage: number) => {
  const params = new URLSearchParams();
  params.set("recPage", String(recPage));
  params.set("productPage", String(productPage));
  return `/?${params.toString()}`;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  return <HomeContent recPage={toPositivePage(params.recPage)} productPage={toPositivePage(params.productPage)} />;
}

async function HomeContent({ recPage, productPage }: { recPage: number; productPage: number }) {
  let recommendations: ProductRecommendation[] = [];
  let products: ProductListItem[] = [];
  let errorMessage: string | null = null;

  try {
    [recommendations, products] = await Promise.all([
      publicApi.getActiveProductRecommendations(),
      publicApi.getProducts(),
    ]);
  } catch (error) {
    errorMessage = mapHttpErrorMessage(error);
  }

  const productMap = new Map(products.map((product) => [String(product.id), product]));
  const recommendedProducts = recommendations
    .slice()
    .sort((left, right) => left.position - right.position)
    .map((recommendation) => productMap.get(String(recommendation.productId)))
    .filter((product): product is ProductListItem => Boolean(product));

  const recommendedTotalPages = Math.max(1, Math.ceil(recommendedProducts.length / ITEMS_PER_PAGE));
  const productsTotalPages = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));

  const safeRecPage = Math.min(recPage, recommendedTotalPages);
  const safeProductPage = Math.min(productPage, productsTotalPages);

  const pagedRecommendedProducts = recommendedProducts.slice(
    (safeRecPage - 1) * ITEMS_PER_PAGE,
    safeRecPage * ITEMS_PER_PAGE
  );
  const pagedProducts = products.slice(
    (safeProductPage - 1) * ITEMS_PER_PAGE,
    safeProductPage * ITEMS_PER_PAGE
  );

  return (
    <main className="bg-white pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildWebsiteJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationJsonLd()) }}
      />

      <section className="section-shell pt-4 sm:pt-6">
        <div className="border-b-4 border-[#db2f27] pb-2">
          <h1 className="text-3xl font-black uppercase tracking-tight text-[#2e37a7] sm:text-4xl lg:text-5xl">
            What&apos;s Trending
          </h1>
        </div>

        <div id="whats-trending" className="mt-8 scroll-mt-28">
          <h2 className="text-xl font-black uppercase tracking-tight text-[#2e37a7] sm:text-2xl lg:text-3xl">
            Sản phẩm đề xuất
          </h2>

          {recommendedProducts.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 lg:gap-6">
              {pagedRecommendedProducts.map((product) => (
                <article key={product.id} className="flex h-full flex-col overflow-hidden rounded-[22px] border border-black/10 bg-white shadow-[0_1px_0_#ddd]">
                  <Link href={`/product/${product.slug || product.id}`} className="group block">
                    <div className="aspect-[1/1] overflow-hidden bg-[#f3f3f3]">
                      {getProductImage(product) ? (
                        <img
                          src={getProductImage(product) || ""}
                          alt={getProductName(product)}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#8f7df7] via-[#f0c8b7] to-[#f2f2f2] text-sm font-semibold uppercase tracking-[0.15em] text-white/90">
                          No image
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col p-2.5 sm:p-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#2e37a7]">
                      {product.sourcePlatform || product.platform}
                    </p>
                    <h3 className="mt-1 line-clamp-2 min-h-[2.4rem] text-sm font-black leading-tight text-black sm:min-h-[3rem] sm:text-xl">
                      {getProductName(product)}
                    </h3>
                    <p className="mt-2 line-clamp-2 min-h-[2.1rem] text-xs text-neutral-600 sm:min-h-[2.5rem] sm:text-sm">
                      {getProductShortDescription(product)}
                    </p>

                    <div className="mt-3 flex flex-wrap items-end gap-2 text-sm font-semibold">
                      {formatMoney(product.originalPrice ?? product.original_price) ? (
                        <span className="text-neutral-500 line-through">
                          {formatMoney(product.originalPrice ?? product.original_price)} đ
                        </span>
                      ) : null}
                      <span className="text-[#2e37a7]">
                        {formatMoney(product.salePrice ?? product.sale_price ?? product.price_reference) || "-"} đ
                      </span>
                    </div>

                    {product.affiliateLink ? (
                      <a
                        href={product.affiliateLink}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className={getBuyButtonClassName(product)}
                      >
                        Mua ngay
                      </a>
                    ) : (
                      <span className="mt-4 inline-flex text-sm text-transparent">Mua ngay</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-neutral-400 bg-white p-6 text-sm text-neutral-600">
              Chưa có sản phẩm đề xuất active.
            </div>
          )}

          {recommendedProducts.length > 0 ? (
            <div className="mt-5 flex items-center justify-center gap-2">
              <Link
                href={buildPageHref(Math.max(1, safeRecPage - 1), safeProductPage)}
                scroll={false}
                aria-disabled={safeRecPage <= 1}
                className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${
                  safeRecPage <= 1
                    ? "pointer-events-none border-slate-200 text-slate-400"
                    : "border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Trước
              </Link>
              <span className="text-sm font-semibold text-slate-700">
                Trang {safeRecPage}/{recommendedTotalPages}
              </span>
              <Link
                href={buildPageHref(Math.min(recommendedTotalPages, safeRecPage + 1), safeProductPage)}
                scroll={false}
                aria-disabled={safeRecPage >= recommendedTotalPages}
                className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${
                  safeRecPage >= recommendedTotalPages
                    ? "pointer-events-none border-slate-200 text-slate-400"
                    : "border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Sau
              </Link>
            </div>
          ) : null}
        </div>

        {errorMessage ? (
          <div className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-12">
          <h2 className="text-xl font-black uppercase tracking-tight text-[#2e37a7] sm:text-2xl lg:text-3xl">
            Danh sách sản phẩm
          </h2>

          {products.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-6">
              {pagedProducts.map((product) => (
                <article key={product.id} className="flex h-full flex-col overflow-hidden rounded-[22px] border border-black/10 bg-white shadow-[0_1px_0_#ddd]">
                  <Link href={`/product/${product.slug || product.id}`} className="group block">
                    <div className="aspect-[4/3] overflow-hidden bg-[#f3f3f3]">
                      {getProductImage(product) ? (
                        <img
                          src={getProductImage(product) || ""}
                          alt={getProductName(product)}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full bg-gradient-to-br from-[#98d2cf] to-[#74a8d0]" />
                      )}
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col p-2.5 sm:p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                      {product.category_name || "Sản phẩm"}
                    </p>
                    <h3 className="mt-2 line-clamp-2 min-h-[2.4rem] text-sm font-black leading-tight text-black sm:min-h-[3rem] sm:text-xl">
                      {getProductName(product)}
                    </h3>
                    <p className="mt-2 line-clamp-2 min-h-[2.1rem] text-xs text-neutral-600 sm:min-h-[2.5rem] sm:text-sm">
                      {getProductShortDescription(product)}
                    </p>

                    <div className="mt-3 flex flex-wrap items-end gap-2 text-sm font-semibold">
                      {formatMoney(product.originalPrice ?? product.original_price) ? (
                        <span className="text-neutral-500 line-through">
                          {formatMoney(product.originalPrice ?? product.original_price)} đ
                        </span>
                      ) : null}
                      <span className="text-[#2e37a7]">
                        {formatMoney(product.salePrice ?? product.sale_price ?? product.price_reference) || "-"} đ
                      </span>
                    </div>

                    {product.affiliateLink ? (
                      <a
                        href={product.affiliateLink}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className={getBuyButtonClassName(product)}
                      >
                        Mua ngay
                      </a>
                    ) : (
                      <span className="mt-4 inline-flex text-sm text-transparent">Mua ngay</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-neutral-400 bg-white p-6 text-sm text-neutral-600">
              Chưa có sản phẩm nào.
            </div>
          )}

          {products.length > 0 ? (
            <div className="mt-5 flex items-center justify-center gap-2">
              <Link
                href={buildPageHref(safeRecPage, Math.max(1, safeProductPage - 1))}
                scroll={false}
                aria-disabled={safeProductPage <= 1}
                className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${
                  safeProductPage <= 1
                    ? "pointer-events-none border-slate-200 text-slate-400"
                    : "border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Trước
              </Link>
              <span className="text-sm font-semibold text-slate-700">
                Trang {safeProductPage}/{productsTotalPages}
              </span>
              <Link
                href={buildPageHref(safeRecPage, Math.min(productsTotalPages, safeProductPage + 1))}
                scroll={false}
                aria-disabled={safeProductPage >= productsTotalPages}
                className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${
                  safeProductPage >= productsTotalPages
                    ? "pointer-events-none border-slate-200 text-slate-400"
                    : "border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Sau
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
