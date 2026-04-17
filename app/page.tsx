import Link from "next/link";
import type { Metadata } from "next";
import { publicApi } from "@/lib/api/public-api";
import { mapHttpErrorMessage } from "@/lib/api/error-messages";
import type { ProductListItem, ProductRecommendation } from "@/lib/api/types";
import { buildOrganizationJsonLd, buildWebsiteJsonLd, toAbsoluteUrl } from "@/lib/seo";

const getProductName = (product: ProductListItem) => product.name || product.title;
const getProductShortDescription = (product: ProductListItem) =>
  product.shortDescription || product.short_description || "Chưa có mô tả";
const getProductImage = (product: ProductListItem) => product.imageUrl || product.image_url;
const getProductPlatform = (product: ProductListItem) =>
  String(product.sourcePlatform || product.platform || "").toLowerCase();
const getBuyButtonClassName = (product: ProductListItem) =>
  getProductPlatform(product).includes("tiktok")
    ? "mt-4 !inline-flex w-fit self-start rounded-lg bg-black px-3 py-1.5 text-sm font-semibold text-white"
    : "mt-4 !inline-flex w-fit self-start rounded-lg bg-[#fb8a5a] px-3 py-1.5 text-sm font-semibold text-white";

export const metadata: Metadata = {
  title: "Review sản phẩm phòng trọ chuẩn SEO",
  description:
    "Trang tổng hợp review sản phẩm phòng trọ, góc học tập và đồ gia dụng nhỏ gọn với nội dung rõ ràng, dễ chọn mua.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Review sản phẩm phòng trọ chuẩn SEO",
    description:
      "Trang tổng hợp review sản phẩm phòng trọ, góc học tập và đồ gia dụng nhỏ gọn với nội dung rõ ràng, dễ chọn mua.",
    url: toAbsoluteUrl("/"),
    type: "website",
  },
};

export default function HomePage() {
  return <HomeContent />;
}

async function HomeContent() {
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

      <section className="section-shell pt-4">
        <div className="border-b-4 border-[#db2f27] pb-2">
          <h1 className="text-5xl font-black uppercase tracking-tight text-[#2e37a7]">
            What&apos;s Trending
          </h1>
        </div>

        <div id="whats-trending" className="mt-8 scroll-mt-28">
          <h2 className="text-2xl font-black uppercase tracking-tight text-[#2e37a7] sm:text-3xl">
            Sản phẩm đề xuất
          </h2>

          {recommendedProducts.length > 0 ? (
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {recommendedProducts.map((product) => (
                <article key={product.id} className="flex h-full flex-col overflow-hidden rounded-[22px] border border-black/10 bg-white shadow-[0_1px_0_#ddd]">
                  <Link href={`/blog/${product.id}`} className="group block">
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

                  <div className="flex flex-1 flex-col p-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#2e37a7]">
                      {product.sourcePlatform || product.platform}
                    </p>
                    <h3 className="mt-1 line-clamp-2 min-h-[3.5rem] text-xl font-black leading-tight text-black">
                      {getProductName(product)}
                    </h3>
                    <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm text-neutral-600">
                      {getProductShortDescription(product)}
                    </p>

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
        </div>

        {errorMessage ? (
          <div className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-12">
          <h2 className="text-2xl font-black uppercase tracking-tight text-[#2e37a7] sm:text-3xl">
            Danh sách sản phẩm
          </h2>

          {products.length > 0 ? (
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <article key={product.id} className="flex h-full flex-col overflow-hidden rounded-[22px] border border-black/10 bg-white shadow-[0_1px_0_#ddd]">
                  <Link href={`/blog/${product.id}`} className="group block">
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

                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                      {product.category_name || "Sản phẩm"}
                    </p>
                    <h3 className="mt-2 line-clamp-2 min-h-[3.5rem] text-2xl font-black leading-tight text-black">
                      {getProductName(product)}
                    </h3>
                    <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm text-neutral-600">
                      {getProductShortDescription(product)}
                    </p>
                    <p className="mt-3 text-lg font-semibold text-[#2e37a7]">
                      {product.price_reference || "-"}
                    </p>

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
        </div>
      </section>
    </main>
  );
}
