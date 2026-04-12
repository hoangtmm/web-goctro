import Link from "next/link";
import { categories, posts } from "@/lib/posts";

const trustPoints = [
  "Chọn sản phẩm phù hợp phòng trọ nhỏ và ngân sách thật",
  "Ưu tiên link mua từ Shopee và TikTok Shop",
  "So sánh nhanh, dễ đọc trên mobile trước khi bấm mua",
];

const affiliateSteps = [
  {
    title: "Chọn nhu cầu",
    description: "Tìm theo đèn học, bàn học, kệ mini hoặc phụ kiện setup.",
  },
  {
    title: "Đọc review ngắn gọn",
    description: "Nội dung đi thẳng vào ưu, nhược điểm và trường hợp nên mua.",
  },
  {
    title: "Đi tới link mua",
    description: "Ưu tiên sản phẩm đang bán trên Shopee hoặc TikTok Shop.",
  },
];

const affiliateHighlights = [
  { label: "Nền tảng", value: "Shopee + TikTok Shop" },
  { label: "Phong cách", value: "Clean affiliate review" },
  { label: "Thiết bị", value: "Mobile, PC, Mac" },
];

export default function HomePage() {
  const featuredPosts = posts.slice(0, 4);

  return (
    <main className="pb-16 pt-8 md:pt-10">
      <section className="section-shell">
        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] md:p-10">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
                Affiliate Review
              </p>
              <h1 className="font-heading mt-4 text-4xl leading-tight font-semibold tracking-tight text-[var(--ink)] md:text-6xl">
                Review sản phẩm phòng trọ đơn giản, rõ ràng và dễ chuyển đổi.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted)] md:text-lg">
                Giao diện được tinh chỉnh theo hướng các website affiliate châu
                Âu: sạch, đáng tin, ít hiệu ứng và tập trung vào nội dung review,
                so sánh và đường dẫn mua trên Shopee, TikTok Shop.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/blog"
                  className="rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent)]"
                >
                  Xem bài review
                </Link>
                <Link
                  href="/danh-muc"
                  className="rounded-full border border-[var(--line-strong)] bg-white px-6 py-3 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--ink)]"
                >
                  Xem danh mục
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {affiliateHighlights.map((item) => (
                  <article
                    key={item.label}
                    className="rounded-[1.25rem] border border-[var(--line)] bg-white p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      {item.label}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
                      {item.value}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <aside className="space-y-4">
              <article className="rounded-[1.5rem] border border-[var(--line)] bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                  Disclosure
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  Một số bài viết có thể chứa liên kết affiliate. Nội dung vẫn
                  ưu tiên trải nghiệm sử dụng, độ phù hợp và ngân sách thực tế.
                </p>
              </article>

              <article className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-soft)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                  Tập trung chính
                </p>
                <div className="mt-4 space-y-3">
                  {trustPoints.map((item) => (
                    <div
                      key={item}
                      className="rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm leading-7 text-[var(--muted)]"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </article>
            </aside>
          </div>
        </div>
      </section>

      <section className="section-shell mt-10">
        <div className="grid gap-4 md:grid-cols-3">
          {affiliateSteps.map((item, index) => (
            <article
              key={item.title}
              className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                Step 0{index + 1}
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--ink)]">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell mt-12">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              Danh mục nổi bật
            </p>
            <div className="mt-6 space-y-4">
              {categories.slice(0, 4).map((item) => (
                <Link
                  key={item.slug}
                  href={`/blog?category=${item.slug}`}
                  className="block rounded-[1.25rem] border border-[var(--line)] bg-white p-5 transition hover:border-[var(--line-strong)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-[var(--ink)]">
                        {item.label}
                      </h2>
                      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                        {item.description}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-[var(--accent)]">
                      Xem
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 md:p-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                  Bài viết mới
                </p>
                <h2 className="font-heading mt-3 text-3xl font-semibold text-[var(--ink)] md:text-4xl">
                  Nội dung review theo đúng nhu cầu mua hàng
                </h2>
              </div>
              <Link
                href="/blog"
                className="text-sm font-semibold text-[var(--accent)]"
              >
                Xem tất cả
              </Link>
            </div>

            <div className="mt-8 grid gap-4">
              {featuredPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block rounded-[1.25rem] border border-[var(--line)] bg-white p-5 transition hover:border-[var(--line-strong)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    {categories.find((item) => item.slug === post.category)?.label}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-[var(--ink)]">
                    {post.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                    {post.description}
                  </p>
                </Link>
              ))}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
