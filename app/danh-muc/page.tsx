import Link from "next/link";
import type { Metadata } from "next";
import { publicApi } from "@/lib/api/public-api";
import { mapHttpErrorMessage } from "@/lib/api/error-messages";
import type { Category } from "@/lib/api/types";
import { toAbsoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Danh mục sản phẩm",
  description:
    "Khám phá danh mục sản phẩm theo nhu cầu và chuyển nhanh sang danh sách review đã lọc.",
  alternates: {
    canonical: "/danh-muc",
  },
  openGraph: {
    title: "Danh mục sản phẩm",
    description:
      "Khám phá danh mục sản phẩm theo nhu cầu và chuyển nhanh sang danh sách review đã lọc.",
    url: toAbsoluteUrl("/danh-muc"),
    type: "website",
  },
};

export default async function CategoryPage() {
  let categories: Category[] = [];
  let errorMessage: string | null = null;

  try {
    categories = await publicApi.getCategories();
  } catch (error) {
    errorMessage = mapHttpErrorMessage(error);
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-16">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Danh mục
        </p>

        <h1 className="mt-3 text-4xl font-bold md:text-5xl">
          Chọn chủ đề bạn quan tâm
        </h1>

        <p className="mt-4 text-lg text-slate-600">
          Mỗi danh mục sẽ dẫn tới trang blog đã lọc sẵn bài viết.
        </p>
      </div>

      {errorMessage ? (
        <div className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {categories.map((category) => {
          const count = Number(category.productCount ?? category.product_count ?? 0);

          return (
            <article
              key={category.id}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="p-6">
                <h2 className="text-2xl font-semibold">{category.name}</h2>
                <p className="mt-3 text-slate-600">{category.description || "Chưa có mô tả."}</p>
                <p className="mt-4 text-sm text-slate-500">{count} sản phẩm</p>

                <Link
                  href={`/blog?category=${category.id}`}
                  className="mt-5 inline-block rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                >
                  Xem danh mục
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}