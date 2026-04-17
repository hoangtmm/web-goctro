"use client";

import { use, useEffect, useState } from "react";
import { adminAffiliateLinksApi } from "@/lib/api/admin-api";
import { mapFieldErrors, mapHttpErrorMessage } from "@/lib/api/error-messages";
import FieldErrors from "@/components/admin/FieldErrors";
import type { AffiliateLink, Platform } from "@/lib/api/types";
import { isAbsoluteUrl } from "@/lib/validation";

type Props = {
  params: Promise<{ id: string }>;
};

export default function AdminAffiliateLinksPage({ params }: Props) {
  const { id } = use(params);
  const productId = String(id);
  const hasValidProductId = productId.trim().length > 0;
  const invalidIdMessage = hasValidProductId ? null : "ID sản phẩm không hợp lệ.";

  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [platform, setPlatform] = useState<Platform>("shopee");
  const [label, setLabel] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [deepLink, setDeepLink] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | string> | null>(null);

  const load = async () => {
    if (!hasValidProductId) {
      return;
    }

    try {
      const data = await adminAffiliateLinksApi.listByProduct(productId);
      setLinks(data);
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
        const data = await adminAffiliateLinksApi.listByProduct(productId);
        setLinks(data);
        setErrorMessage(null);
      } catch (error) {
        setErrorMessage(mapHttpErrorMessage(error));
      }
    };

    void bootstrap();
  }, [hasValidProductId, productId]);

  return (
    <section>
      <h1 className="text-3xl font-bold">Quản lý link mua sản phẩm</h1>
      <p className="mt-1 text-sm text-slate-500">Mã sản phẩm: {productId}</p>
      <p className="mt-2 text-slate-600">affiliate_url/deep_link phải là absolute URL.</p>

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

          if (!isAbsoluteUrl(affiliateUrl)) {
            setErrorMessage("affiliate_url phải là absolute URL.");
            return;
          }

          if (deepLink && !isAbsoluteUrl(deepLink)) {
            setErrorMessage("deep_link phải là absolute URL.");
            return;
          }

          try {
            await adminAffiliateLinksApi.createByProduct(productId, {
              platform,
              label: label.trim() || undefined,
              affiliate_url: affiliateUrl.trim(),
              deep_link: deepLink.trim() || undefined,
              is_active: isActive,
            });
            setLabel("");
            setAffiliateUrl("");
            setDeepLink("");
            setIsActive(true);
            setErrorMessage(null);
            load();
          } catch (error) {
            setErrorMessage(mapHttpErrorMessage(error));
            setFieldErrors(mapFieldErrors(error));
          }
        }}
      >
        <h2 className="text-xl font-semibold">Tạo link mua mới</h2>

        <select
          value={platform}
          onChange={(event) => setPlatform(event.target.value as Platform)}
          className="rounded-xl border border-slate-300 px-4 py-3"
        >
          <option value="shopee">shopee</option>
          <option value="tiktok_shop">tiktok_shop</option>
        </select>

        <input
          placeholder="Nhãn nút (label)"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3"
        />

        <input
          placeholder="URL affiliate"
          value={affiliateUrl}
          onChange={(event) => setAffiliateUrl(event.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3"
        />

        <input
          placeholder="URL deep link"
          value={deepLink}
          onChange={(event) => setDeepLink(event.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3"
        />

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
          />
          Kích hoạt link
        </label>

        <FieldErrors errors={fieldErrors} />

        <button className="rounded-xl bg-slate-900 px-4 py-3 text-white">Tạo link</button>
      </form>

      <div className="mt-6 grid gap-3">
        {links.map((link) => (
          <article key={link.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-lg font-semibold">{link.label || link.platform}</h3>
            <p className="text-sm text-slate-600">Nền tảng: {link.platform}</p>
            <p className="text-sm text-slate-600">Link chính: {link.is_primary ? "Có" : "Không"}</p>
            <p className="text-sm text-slate-600">Kích hoạt: {link.is_active ? "Có" : "Không"}</p>
            <p className="text-sm text-slate-600">Lượt click: {link.click_count ?? 0}</p>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={async () => {
                  await adminAffiliateLinksApi.setPrimary(link.id);
                  load();
                }}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              >
                Đặt link chính
              </button>

              <button
                type="button"
                onClick={async () => {
                  await adminAffiliateLinksApi.remove(link.id);
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
