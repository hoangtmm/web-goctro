import BlogFilters from "@/components/BlogFilters";
import { categories, posts } from "@/lib/posts";

type Props = {
  searchParams: Promise<{
    category?: string | string[];
    q?: string | string[];
  }>;
};

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams;

  const initialCategory =
    typeof params.category === "string" ? params.category : "tat-ca";

  const initialQuery = typeof params.q === "string" ? params.q : "";

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-16">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Bài viết
        </p>

        <h1 className="mt-3 text-4xl font-bold md:text-5xl">
          Bài viết mới nhất
        </h1>

        <p className="mt-4 text-lg text-slate-600">
          Các bài review, so sánh và gợi ý đồ dùng cho phòng trọ, góc học tập.
        </p>
      </div>

      <BlogFilters
        posts={posts}
        categories={categories}
        initialCategory={initialCategory}
        initialQuery={initialQuery}
      />
    </main>
  );
}