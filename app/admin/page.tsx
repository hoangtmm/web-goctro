"use client";

import { useEffect, useState } from "react";
import { adminCategoriesApi, adminProductsApi } from "@/lib/api/admin-api";
import { mapHttpErrorMessage } from "@/lib/api/error-messages";
import type { Category, Platform, ProductListItem } from "@/lib/api/types";
import { isNonNegative } from "@/lib/validation";

const normalizeText = (value: string) => value.trim();

const getProductName = (product: ProductListItem) => product.name || product.title;
const getProductDescription = (product: ProductListItem) =>
  product.shortDescription || product.short_description || product.description || "Chưa có mô tả.";

type PendingAction = {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
};

type EditProductFormState = {
  id: string;
  categoryId: string;
  name: string;
  shortDescription: string;
  description: string;
  originalPrice: string;
  salePrice: string;
  affiliateLink: string;
  sourcePlatform: Platform;
  imageUrl: string;
  imagePublicId: string;
  isRecommended: boolean;
  isFeatured: boolean;
  isActive: boolean;
};

type UpdateResultModal = {
  type: "success" | "error";
  title: string;
  message: string;
};

const defaultEditProductFormState: EditProductFormState = {
  id: "",
  categoryId: "",
  name: "",
  shortDescription: "",
  description: "",
  originalPrice: "0",
  salePrice: "0",
  affiliateLink: "",
  sourcePlatform: "shopee",
  imageUrl: "",
  imagePublicId: "",
  isRecommended: false,
  isFeatured: false,
  isActive: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [originalPrice, setOriginalPrice] = useState("0");
  const [salePrice, setSalePrice] = useState("0");
  const [affiliateLink, setAffiliateLink] = useState("");
  const [sourcePlatform, setSourcePlatform] = useState<Platform>("shopee");
  const [isRecommended, setIsRecommended] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [editProductModalOpen, setEditProductModalOpen] = useState(false);
  const [editProductFormState, setEditProductFormState] = useState<EditProductFormState>(
    defaultEditProductFormState
  );
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreviewUrl, setEditImagePreviewUrl] = useState("");
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
  const [updateResultModal, setUpdateResultModal] = useState<UpdateResultModal | null>(null);

  const load = async () => {
    try {
      const [productData, categoryData] = await Promise.all([
        adminProductsApi.list(),
        adminCategoriesApi.list(),
      ]);

      setProducts(productData);
      setCategories(categoryData);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(mapHttpErrorMessage(error));
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl("");
      return;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [imageFile]);

  useEffect(() => {
    if (!editImageFile) {
      setEditImagePreviewUrl("");
      return;
    }

    const previewUrl = URL.createObjectURL(editImageFile);
    setEditImagePreviewUrl(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [editImageFile]);

  const openEditProductModal = (product: ProductListItem) => {
    setEditProductFormState({
      id: String(product.id || ""),
      categoryId: String(product.category_id || ""),
      name: product.name || product.title || "",
      shortDescription: product.shortDescription || product.short_description || "",
      description: product.description || "",
      originalPrice: String(product.originalPrice ?? product.original_price ?? 0),
      salePrice: String(product.salePrice ?? product.sale_price ?? product.price_reference ?? 0),
      affiliateLink: product.affiliateLink || "",
      sourcePlatform: (product.sourcePlatform as Platform) || product.platform || "shopee",
      imageUrl: product.imageUrl || product.image_url || "",
      imagePublicId: product.imagePublicId || "",
      isRecommended: Boolean(product.isRecommended),
      isFeatured: Boolean(product.isFeatured ?? product.is_featured),
      isActive: Boolean(product.isActive ?? product.is_active),
    });
    setEditImageFile(null);
    setEditImagePreviewUrl("");
    setEditProductModalOpen(true);
  };

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Bảng điều khiển sản phẩm</h1>
          <p className="text-slate-600">Tạo sản phẩm theo đúng luồng BE: chọn danh mục, upload ảnh, rồi lưu product.</p>
        </div>
      </div>

      {errorMessage ? (
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mb-4 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </div>
      ) : null}

      {pendingAction ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Xác nhận thao tác</p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">{pendingAction.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{pendingAction.message}</p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
              >
                Không
              </button>
              <button
                type="button"
                onClick={async () => {
                  const action = pendingAction;
                  setPendingAction(null);
                  if (!action) {
                    return;
                  }

                  try {
                    await action.onConfirm();
                  } catch (error) {
                    setErrorMessage(mapHttpErrorMessage(error));
                  }
                }}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
              >
                {pendingAction.confirmLabel || "Có"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {editProductModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Chỉnh sửa sản phẩm</p>
                <h2 className="mt-2 text-xl font-bold text-slate-900">#{editProductFormState.id} - {editProductFormState.name || "Sản phẩm"}</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditProductModalOpen(false);
                  setEditProductFormState(defaultEditProductFormState);
                  setEditImageFile(null);
                  setEditImagePreviewUrl("");
                }}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
              >
                Đóng
              </button>
            </div>

            <form
              className="mt-5 grid gap-3"
              onSubmit={async (event) => {
                event.preventDefault();

                const nextName = normalizeText(editProductFormState.name);
                const nextCategoryId = Number(editProductFormState.categoryId);
                const parsedOriginalPrice = Number(editProductFormState.originalPrice);
                const parsedSalePrice = Number(editProductFormState.salePrice);

                if (!nextName) {
                  setUpdateResultModal({
                    type: "error",
                    title: "Cập nhật thất bại",
                    message: "Vui lòng nhập tên sản phẩm.",
                  });
                  return;
                }

                if (!editProductFormState.categoryId || !Number.isInteger(nextCategoryId) || nextCategoryId <= 0) {
                  setUpdateResultModal({
                    type: "error",
                    title: "Cập nhật thất bại",
                    message: "Vui lòng chọn danh mục hợp lệ.",
                  });
                  return;
                }

                if (!isNonNegative(parsedOriginalPrice) || !isNonNegative(parsedSalePrice)) {
                  setUpdateResultModal({
                    type: "error",
                    title: "Cập nhật thất bại",
                    message: "Giá gốc và giá sale không được âm.",
                  });
                  return;
                }

                try {
                  setIsUpdatingProduct(true);
                  await adminProductsApi.update(editProductFormState.id, {
                    categoryId: nextCategoryId,
                    name: nextName,
                    shortDescription: normalizeText(editProductFormState.shortDescription) || undefined,
                    description: normalizeText(editProductFormState.description) || undefined,
                    originalPrice: parsedOriginalPrice,
                    salePrice: parsedSalePrice,
                    affiliateLink: normalizeText(editProductFormState.affiliateLink) || undefined,
                    sourcePlatform: editProductFormState.sourcePlatform,
                    imageUrl: normalizeText(editProductFormState.imageUrl) || undefined,
                    imagePublicId: normalizeText(editProductFormState.imagePublicId) || undefined,
                    isRecommended: editProductFormState.isRecommended,
                    isFeatured: editProductFormState.isFeatured,
                    isActive: editProductFormState.isActive,
                    image: editImageFile,
                  });

                  setEditProductModalOpen(false);
                  setEditProductFormState(defaultEditProductFormState);
                  setEditImageFile(null);
                  setEditImagePreviewUrl("");
                  setSuccessMessage("Đã cập nhật sản phẩm.");
                  setErrorMessage(null);
                  setUpdateResultModal({
                    type: "success",
                    title: "Cập nhật thành công",
                    message: "Thông tin sản phẩm đã được cập nhật.",
                  });
                  await load();
                } catch (error) {
                  const message = mapHttpErrorMessage(error);
                  setErrorMessage(message);
                  setUpdateResultModal({
                    type: "error",
                    title: "Cập nhật thất bại",
                    message,
                  });
                } finally {
                  setIsUpdatingProduct(false);
                }
              }}
            >
              <input
                placeholder="Tên sản phẩm"
                value={editProductFormState.name}
                onChange={(event) =>
                  setEditProductFormState((state) => ({ ...state, name: event.target.value }))
                }
                className="rounded-xl border border-slate-300 px-4 py-3"
              />

              <textarea
                placeholder="Mô tả ngắn"
                value={editProductFormState.shortDescription}
                onChange={(event) =>
                  setEditProductFormState((state) => ({ ...state, shortDescription: event.target.value }))
                }
                rows={3}
                className="rounded-xl border border-slate-300 px-4 py-3"
              />

              <textarea
                placeholder="Mô tả chi tiết"
                value={editProductFormState.description}
                onChange={(event) =>
                  setEditProductFormState((state) => ({ ...state, description: event.target.value }))
                }
                rows={4}
                className="rounded-xl border border-slate-300 px-4 py-3"
              />

              <select
                value={editProductFormState.categoryId}
                onChange={(event) =>
                  setEditProductFormState((state) => ({ ...state, categoryId: event.target.value }))
                }
                className="rounded-xl border border-slate-300 px-4 py-3"
              >
                <option value="">Chọn danh mục</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>

              <select
                value={editProductFormState.sourcePlatform}
                onChange={(event) =>
                  setEditProductFormState((state) => ({ ...state, sourcePlatform: event.target.value as Platform }))
                }
                className="rounded-xl border border-slate-300 px-4 py-3"
              >
                <option value="shopee">shopee</option>
                <option value="tiktok_shop">tiktok_shop</option>
              </select>

              <div className="grid gap-3 md:grid-cols-2">
                <input
                  type="number"
                  min={0}
                  placeholder="Giá gốc"
                  value={editProductFormState.originalPrice}
                  onChange={(event) =>
                    setEditProductFormState((state) => ({ ...state, originalPrice: event.target.value }))
                  }
                  className="rounded-xl border border-slate-300 px-4 py-3"
                />
                <input
                  type="number"
                  min={0}
                  placeholder="Giá sale"
                  value={editProductFormState.salePrice}
                  onChange={(event) =>
                    setEditProductFormState((state) => ({ ...state, salePrice: event.target.value }))
                  }
                  className="rounded-xl border border-slate-300 px-4 py-3"
                />
              </div>

              <input
                placeholder="Affiliate link"
                value={editProductFormState.affiliateLink}
                onChange={(event) =>
                  setEditProductFormState((state) => ({ ...state, affiliateLink: event.target.value }))
                }
                className="rounded-xl border border-slate-300 px-4 py-3"
              />

              <input
                placeholder="Image URL"
                value={editProductFormState.imageUrl}
                onChange={(event) =>
                  setEditProductFormState((state) => ({ ...state, imageUrl: event.target.value }))
                }
                className="rounded-xl border border-slate-300 px-4 py-3"
              />

              <div className="grid gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setEditImageFile(event.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-white"
                />

                {editImagePreviewUrl || editProductFormState.imageUrl ? (
                  <div className="grid gap-3 md:grid-cols-[180px_1fr]">
                    <img
                      src={editImagePreviewUrl || editProductFormState.imageUrl}
                      alt="Preview upload"
                      className="h-44 w-full rounded-2xl object-cover"
                    />
                    <div className="space-y-2 text-sm text-slate-700">
                      <p className="font-semibold">
                        {editImagePreviewUrl
                          ? "Ảnh mới sẽ được gửi khi bấm cập nhật sản phẩm."
                          : "Đây là ảnh hiện tại của sản phẩm."}
                      </p>
                      <p>
                        {editImagePreviewUrl
                          ? "Nếu muốn giữ ảnh cũ, hãy xóa lựa chọn file trước khi cập nhật."
                          : "Bạn có thể chọn file ảnh mới để thay thế ảnh hiện tại."}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              <input
                placeholder="Image Public ID"
                value={editProductFormState.imagePublicId}
                onChange={(event) =>
                  setEditProductFormState((state) => ({ ...state, imagePublicId: event.target.value }))
                }
                className="rounded-xl border border-slate-300 px-4 py-3"
              />

              <div className="grid gap-3 md:grid-cols-3">
                <label className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={editProductFormState.isRecommended}
                    onChange={(event) =>
                      setEditProductFormState((state) => ({ ...state, isRecommended: event.target.checked }))
                    }
                  />
                  Recommended
                </label>

                <label className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={editProductFormState.isFeatured}
                    onChange={(event) =>
                      setEditProductFormState((state) => ({ ...state, isFeatured: event.target.checked }))
                    }
                  />
                  Featured
                </label>

                <label className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={editProductFormState.isActive}
                    onChange={(event) =>
                      setEditProductFormState((state) => ({ ...state, isActive: event.target.checked }))
                    }
                  />
                  Active
                </label>
              </div>

              <div className="mt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditProductModalOpen(false);
                    setEditProductFormState(defaultEditProductFormState);
                    setEditImageFile(null);
                    setEditImagePreviewUrl("");
                  }}
                  className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingProduct}
                  className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {isUpdatingProduct ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {updateResultModal ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <p
              className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                updateResultModal.type === "success" ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {updateResultModal.type === "success" ? "Thành công" : "Thất bại"}
            </p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">{updateResultModal.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{updateResultModal.message}</p>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setUpdateResultModal(null)}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <form
        className="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setSuccessMessage(null);

          const nextCategoryId = normalizeText(selectedCategoryId);
          const nextName = normalizeText(name);
          const nextShortDescription = normalizeText(shortDescription);
          const nextDescription = normalizeText(description);
          const nextAffiliateLink = normalizeText(affiliateLink);
          const parsedOriginalPrice = Number(originalPrice);
          const parsedSalePrice = Number(salePrice);

          if (!nextCategoryId) {
            setErrorMessage("Vui lòng chọn danh mục sản phẩm.");
            return;
          }

          if (!nextName) {
            setErrorMessage("Vui lòng nhập tên sản phẩm.");
            return;
          }

          if (!isNonNegative(parsedOriginalPrice) || !isNonNegative(parsedSalePrice)) {
            setErrorMessage("Giá gốc và giá sale không được âm.");
            return;
          }

          if (!imageFile) {
            setErrorMessage("Vui lòng chọn ảnh sản phẩm.");
            return;
          }

          try {
            await adminProductsApi.create({
              categoryId: nextCategoryId,
              name: nextName,
              shortDescription: nextShortDescription || undefined,
              description: nextDescription || undefined,
              originalPrice: parsedOriginalPrice,
              salePrice: parsedSalePrice,
              affiliateLink: nextAffiliateLink || undefined,
              sourcePlatform,
              isRecommended,
              isFeatured,
              isActive,
              image: imageFile,
            });

            setSelectedCategoryId("");
            setName("");
            setShortDescription("");
            setDescription("");
            setOriginalPrice("0");
            setSalePrice("0");
            setAffiliateLink("");
            setSourcePlatform("shopee");
            setIsRecommended(false);
            setIsFeatured(false);
            setIsActive(true);
            setImageFile(null);
            setImagePreviewUrl("");
            setErrorMessage(null);
            setSuccessMessage("Tạo sản phẩm thành công.");
            load();
          } catch (error) {
            setErrorMessage(mapHttpErrorMessage(error));
          }
        }}
      >
        <h2 className="text-xl font-semibold">Tạo sản phẩm mới</h2>

        <select
          value={selectedCategoryId}
          onChange={(event) => setSelectedCategoryId(event.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3"
        >
          <option value="">Chọn danh mục</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        <input
          placeholder="Tên sản phẩm"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3"
        />

        <textarea
          placeholder="Mô tả ngắn"
          value={shortDescription}
          onChange={(event) => setShortDescription(event.target.value)}
          rows={3}
          className="rounded-xl border border-slate-300 px-4 py-3"
        />

        <textarea
          placeholder="Mô tả chi tiết"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
          className="rounded-xl border border-slate-300 px-4 py-3"
        />

        <div className="grid gap-3 md:grid-cols-2">
          <input
            type="number"
            min={0}
            placeholder="Giá gốc"
            value={originalPrice}
            onChange={(event) => setOriginalPrice(event.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3"
          />
          <input
            type="number"
            min={0}
            placeholder="Giá sale"
            value={salePrice}
            onChange={(event) => setSalePrice(event.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3"
          />
        </div>

        <input
          placeholder="Affiliate link"
          value={affiliateLink}
          onChange={(event) => setAffiliateLink(event.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3"
        />

        <div className="grid gap-3 md:grid-cols-3">
          <select
            value={sourcePlatform}
            onChange={(event) => setSourcePlatform(event.target.value as Platform)}
            className="rounded-xl border border-slate-300 px-4 py-3"
          >
            <option value="shopee">shopee</option>
            <option value="tiktok_shop">tiktok_shop</option>
          </select>

          <label className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isRecommended}
              onChange={(event) => setIsRecommended(event.target.checked)}
            />
            Recommended
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(event) => setIsFeatured(event.target.checked)}
            />
            Featured
          </label>
        </div>

        <label className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
          />
          Active
        </label>

        <div className="grid gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-white"
          />

          {imagePreviewUrl ? (
            <div className="grid gap-3 md:grid-cols-[180px_1fr]">
              <img
                src={imagePreviewUrl}
                alt="Preview upload"
                className="h-44 w-full rounded-2xl object-cover"
              />
              <div className="space-y-2 text-sm text-slate-700">
                <p className="font-semibold">Ảnh sẽ được gửi trực tiếp cùng request tạo product.</p>
                <p>Không còn bước upload riêng nữa.</p>
              </div>
            </div>
          ) : null}
        </div>

        <button className="rounded-xl bg-slate-900 px-4 py-3 text-white">Lưu sản phẩm</button>
      </form>

      <div className="grid gap-4">
        {products.map((product) => {
          const productId = String(product.id).trim();
          if (!productId) {
            return null;
          }

          return (
            <article key={productId} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">#{productId}</p>
                  <h2 className="mt-1 text-xl font-semibold">{getProductName(product)}</h2>
                  <p className="mt-2 text-sm text-slate-600">{getProductDescription(product)}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      setPendingAction({
                        title: "Xóa sản phẩm",
                        message: `Bạn có chắc muốn xóa sản phẩm \"${getProductName(product)}\" không?`,
                        confirmLabel: "Xóa",
                        onConfirm: async () => {
                          await adminProductsApi.remove(productId);
                          setSuccessMessage("Đã xóa sản phẩm.");
                          load();
                        },
                      });
                    }}
                    className="rounded-xl border border-rose-300 px-3 py-2 text-sm text-rose-700"
                  >
                    Xóa
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      openEditProductModal(product);
                    }}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  >
                    Chỉnh sửa
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[120px_1fr]">
                <div className="h-28 overflow-hidden rounded-2xl bg-slate-100">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={getProductName(product)} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.12em] text-slate-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="grid gap-2 text-sm text-slate-700">
                  <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                    <span className="rounded-full bg-slate-100 px-3 py-1">Danh mục: {product.category_name || product.category_id || "-"}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">Nguồn: {product.sourcePlatform || product.platform || "-"}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">Trạng thái: {product.status || "-"}</span>
                  </div>
                  <p><span className="font-semibold">Giá gốc:</span> {product.originalPrice ?? product.original_price ?? 0}</p>
                  <p><span className="font-semibold">Giá sale:</span> {product.salePrice ?? product.price_reference ?? 0}</p>
                  <p><span className="font-semibold">Affiliate:</span> {product.affiliateLink || "-"}</p>
                  <p><span className="font-semibold">Image public id:</span> {product.imagePublicId || "-"}</p>
                  <p><span className="font-semibold">Recommended:</span> {String(product.isRecommended ?? false)}</p>
                  <p><span className="font-semibold">Featured:</span> {String(product.isFeatured ?? product.is_featured ?? false)}</p>
                  <p><span className="font-semibold">Active:</span> {String(product.isActive ?? product.is_active ?? false)}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
