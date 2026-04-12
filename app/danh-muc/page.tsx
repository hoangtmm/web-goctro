import Image from "next/image";
import Link from "next/link";
import { categories, posts } from "@/lib/posts";

export default function CategoryPage() {
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

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {categories.map((category) => {
          const count = posts.filter(
            (post) => post.category === category.slug
          ).length;

          return (
            <article
              key={category.slug}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="relative h-56">
                <Image
                  src={category.image}
                  alt={category.label}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              <div className="p-6">
                <h2 className="text-2xl font-semibold">{category.label}</h2>
                <p className="mt-3 text-slate-600">{category.description}</p>
                <p className="mt-4 text-sm text-slate-500">{count} bài viết</p>

                <Link
                  href={`/blog?category=${category.slug}`}
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