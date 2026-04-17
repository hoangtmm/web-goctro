"use client";

import { use, useEffect, useState } from "react";
import { adminCategoriesApi, adminProductsApi } from "@/lib/api/admin-api";
import { mapHttpErrorMessage } from "@/lib/api/error-messages";
import type { Category, Platform } from "@/lib/api/types";
import { isNonNegative } from "@/lib/validation";

type Props = {
  params: Promise<{ id: string }>;
};

export default function AdminEditProductPage({ params }: Props) {
  const { id } = use(params);
  const productId = String(id);
  const hasValidProductId = productId.trim().length > 0;
  const invalidIdMessage = hasValidProductId ? null : "ID sản phẩm không hợp lệ.";

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [originalPrice, setOriginalPrice] = useState("0");
  const [salePrice, setSalePrice] = useState("0");
  const [affiliateLink, setAffiliateLink] = useState("");
  const [sourcePlatform, setSourcePlatform] = useState<Platform>("shopee");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePublicId, setImagePublicId] = useState("");
  const [isRecommended, setIsRecommended] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [categoryId, setCategoryId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!hasValidProductId) {
      return;
    }

    const bootstrap = async () => {
      try {
        const [detail, categoryData] = await Promise.all([
          adminProductsApi.getById(productId),
          adminCategoriesApi.list(),
        ]);

        setName(detail.name || detail.title || "");
        setShortDescription(detail.shortDescription || detail.short_description || "");
        setDescription(detail.description || "");
        setOriginalPrice(String(detail.originalPrice ?? detail.original_price ?? 0));
        setSalePrice(String(detail.salePrice ?? detail.sale_price ?? 0));
        setAffiliateLink(detail.affiliateLink || "");
        setSourcePlatform((detail.sourcePlatform as Platform) || detail.platform || "shopee");
        setImageUrl(detail.imageUrl || detail.image_url || "");
        setImagePublicId(detail.imagePublicId || "");
        setIsRecommended(Boolean(detail.isRecommended));
        setIsFeatured(Boolean(detail.isFeatured ?? detail.is_featured));
        setIsActive(Boolean(detail.isActive ?? detail.is_active));
        setCategoryId(String(detail.category_id || ""));
        setCategories(categoryData);
        setErrorMessage(null);
      } catch (error) {
        setErrorMessage(mapHttpErrorMessage(error));
      }
    };

    void bootstrap();
  }, [hasValidProductId, productId]);

  return (
    <section>
      <h1 className="text-3xl font-bold">Chỉnh sửa sản phẩm</h1>
      <p className="mt-1 text-sm text-slate-500">Mã sản phẩm: {productId}</p>
      <p className="mt-2 text-slate-600">Cập nhật thông tin sản phẩm trước khi xuất bản.</p>

      {errorMessage ? (
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {errorMessage}
        </div>
      ) : null}

      {invalidIdMessage ? (
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {invalidIdMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </div>
      ) : null}

      <form
        className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setSuccessMessage(null);

          const nextName = name.trim();
          const nextCategoryId = Number(categoryId);
          const parsedOriginalPrice = Number(originalPrice);
          const parsedSalePrice = Number(salePrice);

          if (!nextName) {
            setErrorMessage("Vui lòng nhập tên sản phẩm.");
            return;
          }

          if (!categoryId || !Number.isInteger(nextCategoryId) || nextCategoryId <= 0) {
            setErrorMessage("Vui lòng chọn danh mục hợp lệ.");
            return;
          }

          if (!isNonNegative(parsedOriginalPrice) || !isNonNegative(parsedSalePrice)) {
            setErrorMessage("Giá gốc và giá sale không được âm.");
            return;
          }

          try {
            await adminProductsApi.update(productId, {
              categoryId: nextCategoryId,
              name: nextName,
              shortDescription: shortDescription.trim() || undefined,
              description: description.trim() || undefined,
              originalPrice: parsedOriginalPrice,
              salePrice: parsedSalePrice,
              affiliateLink: affiliateLink.trim() || undefined,
              sourcePlatform,
              imageUrl: imageUrl.trim() || undefined,
              imagePublicId: imagePublicId.trim() || undefined,
              isRecommended,
              isFeatured,
              isActive,
            });

            setErrorMessage(null);
            setSuccessMessage("Cập nhật product thành công.");
          } catch (error) {
            setErrorMessage(mapHttpErrorMessage(error));
          }
        }}
      >
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

        <select
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
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
          value={sourcePlatform}
          onChange={(event) => setSourcePlatform(event.target.value as Platform)}
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

        <input
          placeholder="Image URL"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3"
        />

        <input
          placeholder="Image Public ID"
          value={imagePublicId}
          onChange={(event) => setImagePublicId(event.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3"
        />

        <div className="grid gap-3 md:grid-cols-3">
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

          <label className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
            />
            Active
          </label>
        </div>

        <button className="rounded-xl bg-slate-900 px-4 py-3 text-white">Lưu cập nhật</button>
      </form>
    </section>
  );
}
