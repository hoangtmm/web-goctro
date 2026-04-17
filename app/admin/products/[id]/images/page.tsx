"use client";
/* eslint-disable @next/next/no-img-element */

import { use, useEffect, useState } from "react";
import { adminProductImagesApi } from "@/lib/api/admin-api";
import { mapFieldErrors, mapHttpErrorMessage } from "@/lib/api/error-messages";
import FieldErrors from "@/components/admin/FieldErrors";
import type { ProductImage } from "@/lib/api/types";
import { isAbsoluteUrl, isNonNegative } from "@/lib/validation";

type Props = {
  params: Promise<{ id: string }>;
};

export default function AdminProductImagesPage({ params }: Props) {
  const { id } = use(params);
  const productId = String(id);
  const hasValidProductId = productId.trim().length > 0;
  const invalidIdMessage = hasValidProductId ? null : "ID sản phẩm không hợp lệ.";

  const [images, setImages] = useState<ProductImage[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | string> | null>(null);

  const load = async () => {
    if (!hasValidProductId) {
      return;
    }

    try {
      const data = await adminProductImagesApi.listByProduct(productId);
      setImages(data);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(mapHttpErrorMessage(error));
    }
  };

  useEffect(() => {
    if (!hasValidProductId) {
      return;
    }

    const bootstrap = async () => {
      try {
        const data = await adminProductImagesApi.listByProduct(productId);
        setImages(data);
        setErrorMessage(null);
      } catch (error) {
        setErrorMessage(mapHttpErrorMessage(error));
      }
    };

    void bootstrap();
  }, [hasValidProductId, productId]);

  return (
    <section>
      <h1 className="text-3xl font-bold">Quản lý hình ảnh sản phẩm</h1>
      <p className="mt-1 text-sm text-slate-500">Mã sản phẩm: {productId}</p>
      <p className="mt-2 text-slate-600">URL phải là absolute URL, sort_order không âm.</p>

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

      <form
        className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setFieldErrors(null);

          if (!isAbsoluteUrl(imageUrl)) {
            setErrorMessage("image_url phải là absolute URL.");
            return;
          }

          if (thumbnailUrl && !isAbsoluteUrl(thumbnailUrl)) {
            setErrorMessage("thumbnail_url phải là absolute URL.");
            return;
          }

          const parsedSortOrder = Number(sortOrder);
          if (!isNonNegative(parsedSortOrder)) {
            setErrorMessage("sort_order không được âm.");
            return;
          }

          try {
            await adminProductImagesApi.createByProduct(productId, {
              image_url: imageUrl.trim(),
              thumbnail_url: thumbnailUrl.trim() || undefined,
              sort_order: parsedSortOrder,
            });
            setImageUrl("");
            setThumbnailUrl("");
            setSortOrder("0");
            setErrorMessage(null);
            load();
          } catch (error) {
            setErrorMessage(mapHttpErrorMessage(error));
            setFieldErrors(mapFieldErrors(error));
          }
        }}
      >
        <h2 className="text-xl font-semibold">Tạo bản ghi hình ảnh</h2>
        <input
          placeholder="URL ảnh gốc"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3"
        />
        <input
          placeholder="URL ảnh thumbnail"
          value={thumbnailUrl}
          onChange={(event) => setThumbnailUrl(event.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3"
        />
        <input
          type="number"
          min={0}
          placeholder="Thứ tự hiển thị"
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3"
        />
        <FieldErrors errors={fieldErrors} />
        <button className="rounded-xl bg-slate-900 px-4 py-3 text-white">Tạo ảnh</button>
      </form>

      <div className="mt-6 grid gap-3">
        {images.map((image) => (
          <article key={image.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <img src={image.thumbnail_url || image.image_url} alt={image.alt_text || "product image"} className="h-48 w-full rounded-2xl object-cover" />
            <p className="mt-2 text-sm text-slate-600">Thứ tự hiển thị: {image.sort_order}</p>
            <p className="text-sm text-slate-600">Ảnh đại diện: {image.is_cover ? "Có" : "Không"}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={async () => {
                  await adminProductImagesApi.setCover(image.id);
                  load();
                }}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              >
                Đặt ảnh đại diện
              </button>
              <button
                type="button"
                onClick={async () => {
                  await adminProductImagesApi.remove(image.id);
                  load();
                }}
                className="rounded-xl border border-rose-300 px-3 py-2 text-sm text-rose-700"
              >
                Xóa
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
