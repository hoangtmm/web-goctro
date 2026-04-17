"use client";

import { useEffect, useState } from "react";
import { adminCategoriesApi } from "@/lib/api/admin-api";
import { mapHttpErrorMessage } from "@/lib/api/error-messages";
import type { Category } from "@/lib/api/types";

type Toast = {
  id: string;
  message: string;
  type: "success" | "error";
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: "success" | "error") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const load = async () => {
    try {
      const data = await adminCategoriesApi.list();
      setCategories(data);
    } catch (error) {
      addToast(mapHttpErrorMessage(error), "error");
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const data = await adminCategoriesApi.list();
        setCategories(data);
      } catch (error) {
        addToast(mapHttpErrorMessage(error), "error");
      }
    };

    void bootstrap();
  }, []);

  return (
    <section>
      <h1 className="text-3xl font-bold">Quản lý danh mục</h1>
      <p className="mt-2 text-slate-600">Tạo, cập nhật và xóa danh mục cho website.</p>

      {/* Toast Notifications */}
      <div className="fixed right-5 top-5 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg px-4 py-3 text-sm font-medium shadow-lg animate-in fade-in slide-in-from-right-5 ${
              toast.type === "success"
                ? "border border-green-300 bg-green-50 text-green-800"
                : "border border-rose-300 bg-rose-50 text-rose-800"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <form
        className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          const nextName = name.trim();

          if (!nextName) {
            addToast("Vui lòng nhập tên danh mục.", "error");
            return;
          }

          try {
            await adminCategoriesApi.create({
              name: nextName,
              description: description.trim() || undefined,
            });
            setName("");
            setDescription("");
            addToast("Tạo danh mục thành công!", "success");
            load();
          } catch (error) {
            addToast(mapHttpErrorMessage(error), "error");
          }
        }}
      >
        <h2 className="text-xl font-semibold">Tạo danh mục mới</h2>
        <input
          placeholder="Tên danh mục"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3"
        />

        <textarea
          placeholder="Mô tả"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3"
          rows={3}
        />
        <button className="rounded-xl bg-slate-900 px-4 py-3 text-white">Tạo mới</button>
      </form>

      <div className="mt-6 grid gap-3">
        {categories.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-lg font-semibold">{item.name}</h3>
            <p className="mt-1 text-sm text-slate-600">slug: {item.slug}</p>
            <p className="mt-1 text-sm text-slate-600">{item.description || "Chưa có mô tả"}</p>

            <button
              type="button"
              onClick={async () => {
                try {
                  await adminCategoriesApi.remove(item.id);
                  addToast(`Đã xóa danh mục "${item.name}"!`, "success");
                  load();
                } catch (error) {
                  addToast(mapHttpErrorMessage(error), "error");
                }
              }}
              className="mt-3 rounded-xl border border-rose-300 px-3 py-2 text-sm text-rose-700 hover:bg-rose-50 transition"
            >
              Xóa
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
