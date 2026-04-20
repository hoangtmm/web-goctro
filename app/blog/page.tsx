import Link from "next/link";
import type { Metadata } from "next";
import { publicApi } from "@/lib/api/public-api";
import { mapHttpErrorMessage } from "@/lib/api/error-messages";
import type { BlogPostListItem } from "@/lib/api/types";
import { toAbsoluteUrl } from "@/lib/seo";

type Props = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

const getPostTitle = (post: BlogPostListItem) => post.title || "Bai viet";
const getPostDescription = (post: BlogPostListItem) =>
  post.shortDescription || post.short_description || "Chưa có mô tả.";
const getPostImage = (post: BlogPostListItem) => post.thumbnailUrl || post.thumbnail_url;
const getPostSlug = (post: BlogPostListItem) => String(post.slug || post.id || "").trim();

export const metadata: Metadata = {
  title: "Blog",
  description: "Blog chia sẻ review, mẹo mua sắm và kinh nghiệm setup phòng trọ, góc học tập.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog | TapHoaDeal",
    description: "Blog chia sẻ review, mẹo mua sắm và kinh nghiệm setup phòng trọ, góc học tập.",
    url: toAbsoluteUrl("/blog"),
    type: "website",
  },
};

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams;
  const keyword = typeof params.q === "string" ? params.q.trim() : "";

  let posts: BlogPostListItem[] = [];
  let errorMessage: string | null = null;

  try {
    posts = await publicApi.getPosts();
  } catch (error) {
    errorMessage = mapHttpErrorMessage(error);
  }

  const filteredPosts = keyword
    ? posts.filter((post) => {
        const haystack = `${getPostTitle(post)} ${getPostDescription(post)}`.toLowerCase();
        return haystack.includes(keyword.toLowerCase());
      })
    : posts;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#ffffff_0%,_#f4f9ff_45%,_#f8fbff_100%)] py-8 sm:py-10 lg:py-12">
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <h1 className="text-center text-4xl font-black leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
          {keyword ? `Kết quả tìm kiếm cho "${keyword}"` : "Bài viết mới"}
        </h1>
      </section>

      {errorMessage ? (
        <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6">
          <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {errorMessage}
          </div>
        </div>
      ) : null}

      <section className="mx-auto mt-8 max-w-7xl px-4 sm:px-6">
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-6">
            {filteredPosts.map((post) => {
              const slug = getPostSlug(post);
              if (!slug) {
                return null;
              }

              return (
                <article key={String(post.id)} className="overflow-hidden rounded-[22px] border border-black/10 bg-white shadow-[0_1px_0_#ddd]">
                  <Link href={`/blog/${slug}`} className="group block">
                    <div className="aspect-[4/3] overflow-hidden bg-[#f3f3f3]">
                      {getPostImage(post) ? (
                        <img
                          src={getPostImage(post) || ""}
                          alt={getPostTitle(post)}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-[#98d2cf] to-[#74a8d0]" />
                      )}
                    </div>
                  </Link>

                  <div className="flex flex-col p-4">
                    <h2 className="mt-2 line-clamp-2 min-h-[3rem] text-lg font-black leading-tight text-black sm:text-xl">
                      {getPostTitle(post)}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{getPostDescription(post)}</p>

                    <Link
                      href={`/blog/${slug}`}
                      className="mt-4 inline-flex w-fit rounded-lg bg-[#2e37a7] px-3 py-1.5 text-sm font-semibold text-white transition hover:brightness-95"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-sky-200 bg-white p-8 text-sm text-slate-600 shadow-[0_8px_22px_rgba(59,130,246,0.1)]">
            {keyword ? "Không tìm thấy bài viết phù hợp." : "Chưa có bài viết nào."}
          </div>
        )}
      </section>
    </main>
  );
}
