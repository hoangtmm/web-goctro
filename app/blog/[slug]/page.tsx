import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, posts } from "@/lib/posts";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);

  if (!post) {
    return {
      title: "Không tìm thấy bài viết",
    };
  }

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://your-domain.com/blog/${post.slug}`,
      type: "article",
      images: [post.image],
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);

  if (!post) return notFound();

  const category = categories.find((item) => item.slug === post.category);

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-16">
      <article>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          {category?.label ?? "Bài viết"}
        </p>

        <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
          {post.title}
        </h1>

        <p className="mt-4 text-lg text-slate-600">{post.description}</p>

        <div className="mt-8 relative h-72 overflow-hidden rounded-3xl md:h-[420px]">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-10 space-y-6 text-lg leading-8 text-slate-700">
          {post.content.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-2xl font-semibold">Xem sản phẩm tham khảo</h2>
          <p className="mt-3 text-slate-600">
            Đây là vị trí để bạn gắn link affiliate Shopee sau này.
          </p>

          <a
            href="https://shopee.vn/"
            rel="sponsored"
            target="_blank"
            className="mt-5 inline-block rounded-2xl bg-slate-900 px-5 py-3 text-white"
          >
            Xem giá trên Shopee
          </a>
        </div>
      </article>
    </main>
  );
}