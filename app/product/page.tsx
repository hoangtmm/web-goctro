import type { Metadata } from "next";
import { publicApi } from "@/lib/api/public-api";
import { mapHttpErrorMessage } from "@/lib/api/error-messages";
import type { Category, ProductListItem } from "@/lib/api/types";
import { toAbsoluteUrl } from "@/lib/seo";
import Link from "next/link";

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
const getProductPrice = (product: ProductListItem) =>
  product.salePrice ?? product.sale_price ?? product.price_reference;
const formatMoney = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = typeof value === "number" ? value : Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(numericValue) ? numericValue.toLocaleString("vi-VN") : String(value);
};
const normalizeKey = (value: string | number | null | undefined) =>
  String(value ?? "").trim().toLowerCase();

const buildProductHref = (query: string, categoryId?: string) => {
  const params = new URLSearchParams();
  if (categoryId) {
    params.set("category", categoryId);
  }
  if (query) {
    params.set("q", query);
  }

  const search = params.toString();
  return search ? `/product?${search}` : "/product";
};

type Props = {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
  }>;
};

export const metadata: Metadata = {
  title: "Danh sách sản phẩm",
  description:
    "Danh sách sản phẩm đã publish, mô tả ngắn, giá tham khảo để chọn lựa nhanh chóng.",
  alternates: {
    canonical: "/product",
  },
  openGraph: {
    title: "Danh sách sản phẩm review",
    description:
      "Danh sách sản phẩm đã publish, mô tả ngắn, giá tham khảo để chọn lựa nhanh chóng.",
    url: toAbsoluteUrl("/product"),
    type: "website",
  },
};

export default async function ProductPage({ searchParams }: Props) {
  const params = await searchParams;
  let categories: Category[] = [];
  let products: ProductListItem[] = [];
  let errorMessage: string | null = null;

  const initialQuery = typeof params.q === "string" ? params.q : "";
  const selectedCategory = typeof params.category === "string" ? params.category : "";
  const selectedCategoryKey = normalizeKey(selectedCategory);

  try {
    categories = await publicApi.getCategories();

    const selectedCategoryId = categories.find((category) => {
      const categoryId = normalizeKey(category.id);
      const categoryName = normalizeKey(category.name);
      const categorySlug = normalizeKey(category.slug);

      return (
        selectedCategoryKey === categoryId ||
        selectedCategoryKey === categoryName ||
        selectedCategoryKey === categorySlug
      );
    })?.id;

    products = await publicApi.getProducts(
      initialQuery ? undefined : selectedCategoryId ? { categoryId: selectedCategoryId } : undefined
    );
  } catch (error) {
    errorMessage = mapHttpErrorMessage(error);
  }

  const queryFilteredProducts = initialQuery
    ? products.filter((product) =>
        getProductName(product).toLowerCase().includes(initialQuery.toLowerCase()) ||
        (product.shortDescription || product.short_description || "")
          .toLowerCase()
          .includes(initialQuery.toLowerCase())
      )
    : products;

  const categoryItems = categories.map((category) => ({
    id: normalizeKey(category.id),
    name: category.name,
    count: Number(category.productCount ?? category.product_count ?? 0),
  }));

  const totalProductsCount = products.length;
  const sortedCategoryItems = categoryItems
    .slice()
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
  const maxCategoryCount = Math.max(1, ...sortedCategoryItems.map((item) => item.count));

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#ffffff_0%,_#f4f9ff_45%,_#f8fbff_100%)] py-8 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 sm:px-6">
        <h1 className="text-center text-4xl font-black leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
          Danh sách sản phẩm
        </h1>
      </div>

      {errorMessage ? (
        <div className="mx-auto mt-6 max-w-7xl px-5 sm:px-6">
          <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {errorMessage}
          </div>
        </div>
      ) : null}

      <div className="mx-auto mt-8 grid max-w-7xl gap-6 px-4 sm:px-5 sm:gap-8 sm:px-6 lg:grid-cols-[320px_1fr]">
        <aside className="h-fit rounded-[1.5rem] border border-sky-100 bg-white p-4 shadow-[0_14px_30px_rgba(59,130,246,0.12)] sm:rounded-[2rem] sm:p-5 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-slate-500 sm:text-xs">Danh mục</h2>
            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold text-sky-700 sm:text-xs">
              {sortedCategoryItems.length} mục
            </span>
          </div>

          <div className="mt-5 grid gap-2.5">
            <Link
              href={buildProductHref(initialQuery)}
              className={`group rounded-2xl border px-3 py-3 text-sm transition ${
                !selectedCategory
                  ? "border-sky-500 bg-sky-500 text-white shadow-[0_8px_18px_rgba(14,165,233,0.35)]"
                  : "border-sky-100 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="truncate font-semibold">Tất cả sản phẩm</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    !selectedCategory ? "bg-white/25 text-white" : "bg-sky-50 text-sky-700"
                  }`}
                >
                  {totalProductsCount}
                </span>
              </div>
            </Link>

            {sortedCategoryItems.map((category) => {
              const active = selectedCategory === category.id;
              const fillRatio = Math.round((category.count / maxCategoryCount) * 100);

              return (
                <Link
                  key={category.id}
                  href={buildProductHref(initialQuery, category.id)}
                  className={`group rounded-2xl border px-3 py-3 text-sm transition ${
                    active
                      ? "border-sky-500 bg-sky-500 text-white shadow-[0_8px_18px_rgba(14,165,233,0.35)]"
                      : "border-sky-100 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate font-semibold">{category.name}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        active ? "bg-white/25 text-white" : "bg-sky-50 text-sky-700"
                      }`}
                    >
                      {category.count}
                    </span>
                  </div>

                  <div
                    className={`mt-2 h-1.5 overflow-hidden rounded-full ${
                      active ? "bg-white/30" : "bg-sky-100"
                    }`}
                  >
                    <div
                      className={`h-full rounded-full ${active ? "bg-white" : "bg-sky-400"}`}
                      style={{ width: `${fillRatio}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </aside>

        <section>
          {queryFilteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-3 lg:gap-5">
              {queryFilteredProducts.map((product) => (
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
                        <div className="h-full w-full bg-gradient-to-br from-[#98d2cf] to-[#74a8d0]" />
                      )}
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col p-2.5 sm:p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500 sm:text-xs">
                      {product.category_name || "Sản phẩm"}
                    </p>
                    <h3 className="mt-2 line-clamp-2 min-h-[2.4rem] text-sm font-black leading-tight text-black sm:min-h-[3rem] sm:text-xl">
                      {getProductName(product)}
                    </h3>
                    <p className="mt-2 line-clamp-2 min-h-[2.1rem] text-xs leading-5 text-neutral-600 sm:min-h-[2.5rem] sm:text-sm sm:leading-6">
                      {getProductShortDescription(product)}
                    </p>

                    <div className="mt-3 flex flex-wrap items-end gap-2 text-sm font-semibold">
                      {formatMoney(product.originalPrice ?? product.original_price) ? (
                        <span className="text-neutral-500 line-through">
                          {formatMoney(product.originalPrice ?? product.original_price)} đ
                        </span>
                      ) : null}
                      <span className="text-[#2e37a7]">{formatMoney(getProductPrice(product)) || "-"} đ</span>
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
            <div className="rounded-3xl border border-dashed border-sky-200 bg-white p-8 text-sm text-slate-600 shadow-[0_8px_22px_rgba(59,130,246,0.1)]">
              {selectedCategory
                ? "Danh mục này chưa có sản phẩm phù hợp."
                : initialQuery
                  ? "Không tìm thấy sản phẩm phù hợp."
                  : "Chưa có sản phẩm nào."}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
