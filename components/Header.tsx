import Link from "next/link";

const navItems = [
  { href: "/", label: "Trang chủ" },
  { href: "/blog", label: "Bài viết" },
  { href: "/danh-muc", label: "Danh mục" },
];

export default function Header() {
  return (
    <header className="border-b border-[var(--line)] bg-[var(--surface)]">
      <div className="section-shell">
        <div className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--ink)] text-sm font-semibold text-white">
              GT
            </span>
            <span>
              <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Affiliate Review
              </span>
              <span className="font-heading text-xl font-semibold text-[var(--ink)]">
                Góc Trọ Tối Ưu
              </span>
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-4 text-sm text-[var(--muted)]">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition hover:text-[var(--ink)]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/blog"
              className="rounded-full border border-[var(--line-strong)] px-4 py-2 font-semibold text-[var(--ink)] transition hover:border-[var(--ink)]"
            >
              Review mới
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
