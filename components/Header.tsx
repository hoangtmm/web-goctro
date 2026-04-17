"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/#whats-trending", label: "What's Trending" },
  { href: "/blog", label: "Tất cả sản phẩm" },
];

const moreItems = [
  {
    href: "https://www.tiktok.com/@hongtrnminh236?is_from_webapp=1&sender_device=pc",
    label: "TikTok",
  },
  {
    href: "https://www.youtube.com/@LuLuMeo-06",
    label: "YouTube",
  },
  {
    href: "https://www.facebook.com/profile.php?id=61572099449333",
    label: "Facebook",
  },
];

export default function Header() {
  const [isCompact, setIsCompact] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLLIElement | null>(null);
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

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const onResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [isMobileMenuOpen]);

  const navLinkClassName =
    "group relative inline-flex min-h-8 items-center text-neutral-200 transition hover:text-white";

  const underlineTextClassName =
    "relative pb-1 after:absolute after:left-0 after:bottom-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-200 group-hover:after:scale-x-100";

  const closeAllMenus = () => {
    setIsMoreOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-black text-white shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-all duration-300">
      <div className={`section-shell transition-all duration-300 ${isCompact ? "py-2" : "py-3"}`}>
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 md:grid-cols-[1fr_auto_1fr] md:gap-4">
          <form
            className={`mx-auto flex w-full max-w-[220px] items-center rounded-full border border-neutral-400 bg-white text-neutral-800 transition-all duration-300 sm:max-w-[260px] md:mx-0 md:max-w-[280px] ${isCompact ? "px-3 py-1" : "px-4 py-1.5"}`}
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
            className={`mx-auto text-center font-black leading-none tracking-tight transition-all duration-300 hover:underline ${isCompact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl lg:text-5xl"}`}
          >
            TAPHOADEAl
          </Link>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition hover:bg-white/10 md:hidden"
            aria-label="Open menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((value) => !value)}
          >
            <span className="flex flex-col gap-1.5">
              <span className="h-0.5 w-5 rounded-full bg-current" />
              <span className="h-0.5 w-5 rounded-full bg-current" />
              <span className="h-0.5 w-5 rounded-full bg-current" />
            </span>
          </button>

          <div className="hidden md:block" />
        </div>

        <nav className={`hidden pb-1 transition-all duration-300 md:block ${isCompact ? "mt-2" : "mt-4"}`}>
          <ul className={`flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-semibold transition-all duration-300 md:justify-between ${isCompact ? "text-xs" : "text-sm"}`}>
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={navLinkClassName}
                >
                  <span className={underlineTextClassName}>
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}

            <li ref={moreMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsMoreOpen((value) => !value)}
                className="group relative inline-flex min-h-8 items-center text-neutral-200 transition hover:text-white"
                aria-expanded={isMoreOpen}
                aria-haspopup="menu"
              >
                <span className={underlineTextClassName}>
                  More
                </span>
              </button>

              {isMoreOpen ? (
                <div className="absolute right-0 top-full z-50 mt-3 w-44 overflow-hidden rounded-2xl border border-white/10 bg-black/95 py-2 shadow-[0_18px_30px_rgba(0,0,0,0.35)] sm:right-0">
                  {moreItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group block px-4 py-2 text-sm text-neutral-200 transition hover:bg-white/10 hover:text-white"
                      onClick={closeAllMenus}
                    >
                      <span className={underlineTextClassName}>
                        {item.label}
                      </span>
                    </a>
                  ))}
                </div>
              ) : null}
            </li>
          </ul>
        </nav>

        {isMobileMenuOpen ? (
          <div className="mt-3 rounded-3xl border border-white/10 bg-white/5 p-3 text-sm text-white shadow-[0_18px_30px_rgba(0,0,0,0.28)] md:hidden">
            <div className="grid gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-2xl px-4 py-3 text-left font-semibold text-white transition hover:bg-white/10"
                  onClick={closeAllMenus}
                >
                  {item.label}
                </Link>
              ))}

              <div className="mt-2 border-t border-white/10 pt-2">
                <p className="px-4 pb-2 text-xs font-bold uppercase tracking-[0.22em] text-white/60">More</p>
                <div className="grid gap-2">
                  {moreItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl px-4 py-3 font-semibold text-white transition hover:bg-white/10"
                      onClick={closeAllMenus}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
