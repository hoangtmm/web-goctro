"use client";

import { useEffect, useState } from "react";
import { publicApi } from "@/lib/api/public-api";
import { adminProductRecommendationsApi } from "@/lib/api/admin-api";
import { mapHttpErrorMessage } from "@/lib/api/error-messages";
import type { ProductListItem, ProductRecommendation } from "@/lib/api/types";

type Toast = {
  id: string;
  message: string;
  type: "success" | "error";
};

export default function ProductRecommendationsPage() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [productId, setProductId] = useState("");
  const [title, setTitle] = useState("");
  const [position, setPosition] = useState("1");
  const [isActive, setIsActive] = useState(true);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  const addToast = (message: string, type: "success" | "error") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const load = async () => {
    try {
      setIsLoading(true);
      const [productsData, recommendationsData] = await Promise.all([
        publicApi.getProducts(),
        adminProductRecommendationsApi.list(),
      ]);
      setProducts(productsData);
      setRecommendations(recommendationsData);
    } catch (error) {
      console.error("Load error:", error);
      addToast(mapHttpErrorMessage(error), "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const getProductName = (pid: string | number) => {
    const product = products.find((p) => String(p.id) === String(pid));
    return product?.name || product?.title || "Unknown Product";
  };

  const toIsoDateTime = (value: string) => {
    if (!value) {
      return undefined;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  };

  return (
    <section>
      <h1 className="text-3xl font-bold">Quản lý sản phẩm đề xuất</h1>
      <p className="mt-2 text-slate-600">Đẩy sản phẩm lên phần đề xuất cho khách hàng.</p>

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

          if (!productId) {
            addToast("Vui lòng chọn sản phẩm.", "error");
            return;
          }

          if (!title.trim()) {
            addToast("Vui lòng nhập tiêu đề.", "error");
            return;
          }

          try {
            const payload = {
              productId: Number(productId),
              title: title.trim(),
              position: parseInt(position) || 1,
              isActive: isActive,
              startAt: toIsoDateTime(startAt) ?? null,
              endAt: toIsoDateTime(endAt) ?? null,
            };
            
            console.log("Submitting payload:", payload);
            await adminProductRecommendationsApi.create(payload);

            setProductId("");
            setTitle("");
            setPosition("1");
            setIsActive(true);
            setStartAt("");
            setEndAt("");
            addToast("Thêm sản phẩm đề xuất thành công!", "success");
            load();
          } catch (error) {
            console.error("Submit error:", error);
            addToast(mapHttpErrorMessage(error), "error");
          }
        }}
      >
        <h2 className="text-xl font-semibold">Thêm sản phẩm đề xuất</h2>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sản phẩm</label>
            {isLoading ? (
              <div className="w-full rounded-xl border border-slate-300 px-4 py-3 bg-slate-50 text-slate-500">
                Đang tải sản phẩm...
              </div>
            ) : products.length === 0 ? (
              <div className="w-full rounded-xl border border-slate-300 px-4 py-3 bg-slate-50 text-slate-500">
                Không có sản phẩm nào
              </div>
            ) : (
              <select
                value={productId}
                onChange={(event) => setProductId(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              >
                <option value="">-- Chọn sản phẩm --</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name || product.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề</label>
            <input
              type="text"
              placeholder="Tiêu đề đề xuất"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Vị trí</label>
            <input
              type="number"
              min="1"
              value={position}
              onChange={(event) => setPosition(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 pt-8">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                className="rounded border-slate-300"
              />
              Kích hoạt ngay
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bắt đầu từ</label>
            <input
              type="datetime-local"
              value={startAt}
              onChange={(event) => setStartAt(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kết thúc lúc</label>
            <input
              type="datetime-local"
              value={endAt}
              onChange={(event) => setEndAt(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />
          </div>
        </div>

        <button 
          disabled={isLoading}
          className="rounded-xl bg-slate-900 px-4 py-3 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Đang tải..." : "Thêm đề xuất"}
        </button>
      </form>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Danh sách sản phẩm đề xuất</h2>
        <div className="grid gap-3">
          {recommendations.length > 0 ? (
            recommendations
              .sort((a, b) => Number(a.position) - Number(b.position))
              .map((recommendation) => (
                <article key={recommendation.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{recommendation.title}</h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                            recommendation.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {recommendation.isActive ? "Hoạt động" : "Tắt"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        Sản phẩm: {getProductName(recommendation.productId)}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Vị trí: <strong>#{Number(recommendation.position)}</strong>
                      </p>
                      {recommendation.startAt && (
                        <p className="mt-1 text-sm text-slate-600">
                          Từ: {new Date(recommendation.startAt).toLocaleString("vi-VN")}
                        </p>
                      )}
                      {recommendation.endAt && (
                        <p className="text-sm text-slate-600">
                          Đến: {new Date(recommendation.endAt).toLocaleString("vi-VN")}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await adminProductRecommendationsApi.remove(recommendation.id);
                          addToast("Đã xóa đề xuất!", "success");
                          load();
                        } catch (error) {
                          addToast(mapHttpErrorMessage(error), "error");
                        }
                      }}
                      className="rounded-xl border border-rose-300 px-3 py-2 text-sm text-rose-700 hover:bg-rose-50 transition"
                    >
                      Xóa
                    </button>
                  </div>
                </article>
              ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-600">
              Chưa có sản phẩm đề xuất nào.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
