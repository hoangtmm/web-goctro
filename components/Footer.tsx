import Link from "next/link";

export default function Footer() {
  return (
    <footer className="pb-8 pt-16">
      <div className="section-shell">
        <div className="grid gap-8 rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] px-6 py-8 md:grid-cols-[1.3fr_0.8fr_0.9fr] md:px-8">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              Shopee & TikTok Shop Affiliate
            </p>
            <h2 className="font-heading text-3xl font-semibold text-[var(--ink)]">
              Giao diện tối giản để người đọc tập trung vào review và link mua.
            </h2>
            <p className="max-w-xl text-sm leading-7 text-[var(--muted)]">
              Phù hợp cho website affiliate sản phẩm phòng trọ, góc học tập và
              đồ gia dụng nhỏ gọn theo phong cách clean, trung tính và dễ tin cậy.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Điều hướng
            </h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/blog" className="hover:text-[var(--accent)]">
                Bài review
              </Link>
              <Link href="/danh-muc" className="hover:text-[var(--accent)]">
                Danh mục
              </Link>
              <Link href="/" className="hover:text-[var(--accent)]">
                Trang chủ
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Ghi chú
            </h3>
            <p className="text-sm leading-7 text-[var(--muted)]">
              © 2026 Góc Trọ Tối Ưu. Một số liên kết có thể là affiliate link từ
              Shopee hoặc TikTok Shop.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
