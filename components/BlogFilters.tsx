"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Category, Post } from "@/lib/posts";

type Props = {
  posts: Post[];
  categories: Category[];
  initialCategory?: string;
  initialQuery?: string;
};

export default function BlogFilters({
  posts,
  categories,
  initialCategory = "tat-ca",
  initialQuery = "",
}: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  const categoryMap = new Map(categories.map((item) => [item.slug, item.label]));

  const filteredPosts = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return posts.filter((post) => {
      const matchCategory =
        activeCategory === "tat-ca" || post.category === activeCategory;

      const searchableText = [
        post.title,
        post.description,
        post.tags.join(" "),
        categoryMap.get(post.category) ?? "",
      ]
        .join(" ")
        .toLowerCase();

      const matchQuery = !keyword || searchableText.includes(keyword);

      return matchCategory && matchQuery;
    });
  }, [posts, query, activeCategory, categoryMap]);

  return (
    <section className="mt-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <input
            type="text"
            placeholder="Tìm bài viết, ví dụ: đèn học, bàn gấp..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
          />

          <button
            type="button"
            onClick={() => {
              setQuery("");
              setActiveCategory("tat-ca");
            }}
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium"
          >
            Xóa lọc
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveCategory("tat-ca")}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              activeCategory === "tat-ca"
                ? "bg-slate-900 text-white"
                : "border border-slate-300 text-slate-700"
            }`}
          >
            Tất cả
          </button>

          {categories.map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => setActiveCategory(category.slug)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                activeCategory === category.slug
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 text-slate-700"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Tìm thấy <span className="font-semibold">{filteredPosts.length}</span> bài viết
        </p>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          Không tìm thấy bài viết phù hợp.
        </div>
      ) : (
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          {filteredPosts.map((post) => (
            <article
              key={post.slug}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="relative h-56 w-full">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {categoryMap.get(post.category)}
                </p>

                <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                  {post.title}
                </h2>

                <p className="mt-3 text-slate-600">{post.description}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-5 inline-block rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                >
                  Đọc bài viết
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}