"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/#whats-trending", label: "What's Trending" },
  { href: "/blog", label: "Tất cả sản phẩm" },
  { href: "/blog", label: "More" },
];

export default function Header() {
  const [isCompact, setIsCompact] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => {
      setIsCompact(window.scrollY > 0);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-black text-white shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-all duration-300">
      <div className={`section-shell transition-all duration-300 ${isCompact ? "py-2" : "py-3"}`}>
        <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
          <form
            className={`mx-auto flex w-full max-w-[280px] items-center rounded-full border border-neutral-400 bg-white text-neutral-800 transition-all duration-300 md:mx-0 ${isCompact ? "px-3 py-1" : "px-4 py-1.5"}`}
            onSubmit={(event) => {
              event.preventDefault();
              const keyword = searchValue.trim();

              if (!keyword) {
                router.push("/blog");
                return;
              }

              router.push(`/blog?q=${encodeURIComponent(keyword)}`);
            }}
          >
            <input
              type="search"
              placeholder="Search..."
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-500"
            />
            <button type="submit" className="text-sm" aria-label="Search">
              🔍
            </button>
          </form>

          <Link
            href="/"
            className={`mx-auto text-center font-black leading-none tracking-tight transition-all duration-300 ${isCompact ? "text-3xl" : "text-5xl"}`}
          >
            TAPHOA76
          </Link>

          <div className="hidden md:block" />
        </div>

        <nav className={`overflow-x-auto pb-1 transition-all duration-300 ${isCompact ? "mt-2" : "mt-4"}`}>
          <ul className={`flex min-w-max items-center justify-between font-semibold transition-all duration-300 ${isCompact ? "gap-6 text-xs" : "gap-8 text-sm"}`}>
            {navItems.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="text-neutral-200 transition hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

    </header>
  );
}
