"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Category, ProductListItem } from "@/lib/api/types";
import { PLATFORM_VALUES, PRODUCT_STATUS_VALUES } from "@/lib/api/types";

type Props = {
  products: ProductListItem[];
  categories: Category[];
  initialCategory?: string;
  initialQuery?: string;
  featured?: boolean;
};

export default function BlogFilters({
  products,
  categories,
  initialCategory = "tat-ca",
  initialQuery = "",
  featured = false,
}: Props) {
  const [query, setQuery] = useState(initialQuery);
  const activeCategory = initialCategory;

  const categoryMap = useMemo(
    () => new Map(categories.map((item) => [String(item.id), item.name])),
    [categories]
  );

  const filteredProducts = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchCategory =
        activeCategory === "tat-ca" || String(product.category_id) === activeCategory;

      const searchableText = [
        product.title,
        product.short_description,
        product.platform,
        product.status,
        categoryMap.get(String(product.category_id)) ?? "",
      ]
        .join(" ")
        .toLowerCase();

      const matchQuery = !keyword || searchableText.includes(keyword);

      return matchCategory && matchQuery;
    });
  }, [products, query, activeCategory, categoryMap]);

  return (
    <section className="mt-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <input
            type="text"
            placeholder="Tìm sản phẩm, ví dụ: đèn học, bàn gấp..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
          />

          <button
            type="button"
            onClick={() => {
              setQuery("");
            }}
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium"
          >
            Xóa lọc
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/blog"
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              activeCategory === "tat-ca" && !featured
                ? "bg-slate-900 text-white"
                : "border border-slate-300 text-slate-700"
            }`}
          >
            Tất cả
          </Link>

          <Link
            href="/blog?featured=1"
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              featured
                ? "bg-slate-900 text-white"
                : "border border-slate-300 text-slate-700"
            }`}
          >
            Featured
          </Link>

          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/blog?categoryId=${category.id}`}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                activeCategory === String(category.id)
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 text-slate-700"
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Tìm thấy <span className="font-semibold">{filteredProducts.length}</span> sản phẩm
        </p>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          Không tìm thấy sản phẩm phù hợp.
        </div>
      ) : (
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          {filteredProducts.map((product) => (
            <article
              key={product.id}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {categoryMap.get(String(product.category_id)) ?? "Danh mục"}
                </p>

                <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                  {product.title}
                </h2>

                <p className="mt-3 text-slate-600">
                  {product.short_description || "Chưa có mô tả ngắn."}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    Nền tảng: {PLATFORM_VALUES.includes(product.platform) ? product.platform : "khác"}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    Trạng thái: {PRODUCT_STATUS_VALUES.includes(product.status) ? product.status : "khác"}
                  </span>
                  {product.review_score !== null && product.review_score !== undefined ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                      Điểm: {product.review_score}/10
                    </span>
                  ) : null}
                </div>

                <Link
                  href={`/blog/${product.slug}`}
                  className="mt-5 inline-block rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                >
                  Xem review
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}