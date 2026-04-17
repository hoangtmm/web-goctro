"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminAuthApi } from "@/lib/api/admin-api";
import { mapHttpErrorMessage } from "@/lib/api/error-messages";
import { setSession } from "@/lib/auth/session";
import { isValidEmail } from "@/lib/validation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!isValidEmail(email)) {
      setErrorMessage("Email không đúng định dạng.");
      return;
    }

    if (!password.trim()) {
      setErrorMessage("Vui lòng nhập mật khẩu.");
      return;
    }

    try {
      setLoading(true);
      const response = await adminAuthApi.login({
        email: email.trim(),
        password,
      });

      setSession(response);
      router.replace("/admin");
    } catch (error) {
      setErrorMessage(mapHttpErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-5 py-16">
      <div className="mx-auto max-w-md">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Admin login
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">Đăng nhập quản trị</h1>
            <p className="mt-2 text-slate-600">
              Nhập email và mật khẩu để vào khu vực quản trị.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950"
                placeholder="hoangtm06@gmail.com"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950"
                placeholder="String@123"
              />
            </label>

            {errorMessage ? (
              <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-slate-950 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
