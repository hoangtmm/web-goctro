"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, getSession } from "@/lib/auth/session";
import type { AdminUser } from "@/lib/api/types";

type Props = {
  children: React.ReactNode;
};

const navItems = [
  { href: "/admin", label: "Sản phẩm" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/categories", label: "Danh mục" },
  { href: "/admin/product-recommendations", label: "Đề xuất" },
];

export default function AdminLayoutShell({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      return;
    }

    const session = getSession();
    if (!session?.token) {
      clearSession();
      router.replace("/admin/login");
      return;
    }

    setAdmin(session.admin ?? null);
  }, [isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Khu vực quản trị</p>
            <p className="text-sm text-slate-700">
              {admin?.full_name || admin?.email || "Đang tải profile..."}
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition ${pathname === item.href ? "font-semibold text-slate-900" : "text-slate-600 hover:text-slate-900"}`}
              >
                {item.label}
              </Link>
            ))}

            <button
              type="button"
              onClick={() => {
                clearSession();
                router.replace("/admin/login");
              }}
              className="rounded-xl border border-slate-300 px-3 py-2"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        {children}
      </main>
    </div>
  );
}
