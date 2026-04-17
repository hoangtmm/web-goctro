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
    ? "mt-4 !inline-flex w-fit self-start rounded-lg bg-black px-3 py-1.5 text-sm font-semibold text-white"
    : "mt-4 !inline-flex w-fit self-start rounded-lg bg-[#fb8a5a] px-3 py-1.5 text-sm font-semibold text-white";
const normalizeKey = (value: string | number | null | undefined) =>
  String(value ?? "").trim().toLowerCase();

const buildBlogHref = (query: string, categoryId?: string) => {
  const params = new URLSearchParams();
  if (categoryId) {
    params.set("category", categoryId);
  }
  if (query) {
    params.set("q", query);
  }

  const search = params.toString();
  return search ? `/blog?${search}` : "/blog";
};

type Props = {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
  }>;
};

export const metadata: Metadata = {
  title: "Danh sách sản phẩm ",
  description:
    "Danh sách sản phẩm đã publish, mô tả ngắn, giá tham khảo để chọn lựa nhanh chóng.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Danh sách sản phẩm review",
    description:
      "Danh sách sản phẩm đã publish, mô tả ngắn, giá tham khảo để chọn lựa nhanh chóng.",
    url: toAbsoluteUrl("/blog"),
    type: "website",
  },
};

export default async function BlogPage({ searchParams }: Props) {
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

  const normalizedQuery = initialQuery.trim().toLowerCase();
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#ffffff_0%,_#f4f9ff_45%,_#f8fbff_100%)] py-12">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <section className="rounded-[2rem] border border-sky-100 bg-white px-7 py-8 shadow-[0_18px_36px_rgba(59,130,246,0.12)] sm:px-10">
          <p className="text-xs font-extrabold uppercase tracking-[0.35em] text-slate-500">
            Sản phẩm
          </p>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-4xl font-black leading-tight text-slate-950 md:text-5xl">
              {initialQuery ? `Kết quả tìm kiếm cho "${initialQuery}"` : "Danh sách sản phẩm "}
            </h1>

            <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-right">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Sản phẩm hiển thị</p>
              <p className="mt-1 text-2xl font-black text-slate-900">{queryFilteredProducts.length}</p>
            </div>
          </div>

          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
            {initialQuery
              ? `Tìm thấy ${queryFilteredProducts.length} sản phẩm khớp từ khóa "${initialQuery}".`
              : ""}
          </p>
        </section>
      </div>

      {errorMessage ? (
        <div className="mx-auto mt-6 max-w-7xl px-5 sm:px-6">
          <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {errorMessage}
          </div>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mx-auto mt-6 max-w-7xl px-5 sm:px-6">
          <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {errorMessage}
          </div>
        </div>
      ) : null}

      <div className="mx-auto mt-8 grid max-w-7xl gap-8 px-5 sm:px-6 lg:grid-cols-[320px_1fr]">
        <aside className="h-fit rounded-[2rem] border border-sky-100 bg-white p-5 shadow-[0_14px_30px_rgba(59,130,246,0.12)] lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase tracking-[0.28em] text-slate-500">Danh mục</h2>
            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
              {sortedCategoryItems.length} mục
            </span>
          </div>

          <div className="mt-5 grid gap-2.5">
            <Link
              href={buildBlogHref(initialQuery)}
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
                  href={buildBlogHref(initialQuery, category.id)}
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
          {initialQuery ? (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm text-slate-600 shadow-[0_8px_22px_rgba(59,130,246,0.08)]">
              <p>
                {queryFilteredProducts.length} results for keyword {initialQuery}
              </p>
            </div>
          ) : null}

          {queryFilteredProducts.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {queryFilteredProducts.map((product) => (
                <article key={product.id} className="group flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-sky-100 bg-white p-4 shadow-[0_8px_22px_rgba(59,130,246,0.1)] transition hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(59,130,246,0.16)]">
                  <Link href={`/blog/${product.id}`} className="group block">
                    <div className="h-44 overflow-hidden rounded-2xl bg-sky-50">
                      {getProductImage(product) ? (
                        <img src={getProductImage(product) || ""} alt={getProductName(product)} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-[#98d2cf] to-[#74a8d0]" />
                      )}
                    </div>
                  </Link>

                  <div className="mt-3 flex flex-1 flex-col">
                    <h3 className="line-clamp-2 min-h-[3.5rem] text-2xl font-black leading-tight text-slate-900">
                      {getProductName(product)}
                    </h3>
                    <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm leading-6 text-slate-600">
                      {getProductShortDescription(product)}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-700">
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