"use client";

import { useEffect, useMemo, useState } from "react";
import { adminPostsApi, adminProductsApi, adminTagsApi } from "@/lib/api/admin-api";
import { mapHttpErrorMessage } from "@/lib/api/error-messages";
import type { BlogPostListItem, ProductListItem, Tag } from "@/lib/api/types";

type PostFormState = {
  title: string;
  shortDescription: string;
  content: string;
  type: string;
  status: string;
  isFeatured: boolean;
  seoTitle: string;
  seoDescription: string;
  publishedAt: string;
};

type AttachedPostProduct = {
  postProductId: string;
  productId: string;
  productName: string;
  position: number | null;
};

type AttachedPostTag = {
  tagId: string;
  tagName: string;
};

type EditPostFormState = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  type: string;
  status: string;
  isFeatured: boolean;
  seoTitle: string;
  seoDescription: string;
  publishedAt: string;
  thumbnailUrl: string;
};

type UpdateResultModal = {
  type: "success" | "error";
  title: string;
  message: string;
};

const defaultFormState: PostFormState = {
  title: "",
  shortDescription: "",
  content: "",
  type: "blog",
  status: "published",
  isFeatured: true,
  seoTitle: "",
  seoDescription: "",
  publishedAt: "",
};

const defaultEditPostFormState: EditPostFormState = {
  id: "",
  title: "",
  shortDescription: "",
  content: "",
  type: "blog",
  status: "draft",
  isFeatured: false,
  seoTitle: "",
  seoDescription: "",
  publishedAt: "",
  thumbnailUrl: "",
};

const toInputDateTimeValue = (value?: string | null) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const getPostDescription = (post: BlogPostListItem) =>
  post.shortDescription || post.short_description || "Chưa có mô tả.";

const getProductName = (product: ProductListItem) => product.name || product.title || `#${product.id}`;

const toPostProducts = (detail: any): AttachedPostProduct[] => {
  const source = [
    ...(Array.isArray(detail?.postProducts) ? detail.postProducts : []),
    ...(Array.isArray(detail?.post_products) ? detail.post_products : []),
    ...(Array.isArray(detail?.products) ? detail.products : []),
  ];

  const seen = new Set<string>();
  const mapped: AttachedPostProduct[] = [];

  for (const item of source) {
    const postProductId = String(item?.postProductId ?? item?.post_product_id ?? item?.id ?? "").trim();
    const productId = String(item?.productId ?? item?.product_id ?? item?.product?.id ?? "").trim();
    const productName = String(
      item?.productName ??
        item?.product_name ??
        item?.product?.name ??
        item?.product?.title ??
        (productId ? `#${productId}` : "Sản phẩm")
    ).trim();
    const rawPosition = item?.position ?? item?.sortOrder ?? item?.sort_order ?? null;
    const parsedPosition =
      rawPosition === null || rawPosition === undefined || rawPosition === "" ? null : Number(rawPosition);

    const key = `${postProductId}::${productId}::${productName}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    mapped.push({
      postProductId,
      productId,
      productName,
      position: Number.isFinite(parsedPosition) ? parsedPosition : null,
    });
  }

  return mapped;
};

const toPostTags = (detail: any): AttachedPostTag[] => {
  const source = [
    ...(Array.isArray(detail?.tags) ? detail.tags : []),
    ...(Array.isArray(detail?.postTags) ? detail.postTags : []),
    ...(Array.isArray(detail?.post_tags) ? detail.post_tags : []),
  ];

  const seen = new Set<string>();
  const mapped: AttachedPostTag[] = [];

  for (const item of source) {
    const tagId = String(item?.tagId ?? item?.tag_id ?? item?.id ?? item?.tag?.id ?? "").trim();
    const tagName = String(item?.name ?? item?.tagName ?? item?.tag_name ?? item?.tag?.name ?? "").trim();

    if (!tagId) {
      continue;
    }

    const key = `${tagId}::${tagName}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    mapped.push({
      tagId,
      tagName: tagName || `#${tagId}`,
    });
  }

  return mapped;
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPostListItem[]>([]);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingEditId, setLoadingEditId] = useState<string>("");
  const [activeRelationPostId, setActiveRelationPostId] = useState<string>("");
  const [formState, setFormState] = useState<PostFormState>(defaultFormState);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [editPostModalOpen, setEditPostModalOpen] = useState(false);
  const [editPostFormState, setEditPostFormState] = useState<EditPostFormState>(defaultEditPostFormState);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreviewUrl, setEditImagePreviewUrl] = useState("");
  const [isUpdatingPost, setIsUpdatingPost] = useState(false);
  const [updateResultModal, setUpdateResultModal] = useState<UpdateResultModal | null>(null);

  const [attachProductIdByPost, setAttachProductIdByPost] = useState<Record<string, string>>({});
  const [attachPositionByPost, setAttachPositionByPost] = useState<Record<string, string>>({});
  const [productSearchByPost, setProductSearchByPost] = useState<Record<string, string>>({});
  const [attachTagIdByPost, setAttachTagIdByPost] = useState<Record<string, string>>({});

  const [relationLoadingByPost, setRelationLoadingByPost] = useState<Record<string, boolean>>({});
  const [postProductsByPost, setPostProductsByPost] = useState<Record<string, AttachedPostProduct[]>>({});
  const [postTagsByPost, setPostTagsByPost] = useState<Record<string, AttachedPostTag[]>>({});

  const sortedPosts = useMemo(
    () =>
      [...posts].sort((left, right) => {
        const leftTime = new Date(
          left.publishedAt || left.published_at || left.createdAt || left.created_at || 0
        ).getTime();
        const rightTime = new Date(
          right.publishedAt || right.published_at || right.createdAt || right.created_at || 0
        ).getTime();
        return rightTime - leftTime;
      }),
    [posts]
  );

  const loadPosts = async () => {
    try {
      const data = await adminPostsApi.list();
      setPosts(Array.isArray(data) ? data : []);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(mapHttpErrorMessage(error));
    }
  };

  const loadReferenceData = async () => {
    try {
      const [productData, tagData] = await Promise.all([adminProductsApi.list(), adminTagsApi.list()]);
      setProducts(Array.isArray(productData) ? productData : []);
      setTags(Array.isArray(tagData) ? tagData : []);
    } catch (error) {
      setErrorMessage(mapHttpErrorMessage(error));
    }
  };

  const loadPostRelations = async (postId: string) => {
    try {
      setRelationLoadingByPost((state) => ({ ...state, [postId]: true }));
      const detail = await adminPostsApi.getById(postId);
      setPostProductsByPost((state) => ({ ...state, [postId]: toPostProducts(detail as any) }));
      setPostTagsByPost((state) => ({ ...state, [postId]: toPostTags(detail as any) }));
    } catch {
      setPostProductsByPost((state) => ({ ...state, [postId]: [] }));
      setPostTagsByPost((state) => ({ ...state, [postId]: [] }));
    } finally {
      setRelationLoadingByPost((state) => ({ ...state, [postId]: false }));
    }
  };

  useEffect(() => {
    void loadPosts();
    void loadReferenceData();
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

  const resetForm = () => {
    setFormState(defaultFormState);
    setLoadingEditId("");
    setImageFile(null);
    setImagePreviewUrl("");
  };

  const beginEditPost = async (id: string) => {
    try {
      setLoadingEditId(id);
      const detail = await adminPostsApi.getById(id);

      setEditPostFormState({
        id,
        title: detail.title || "",
        shortDescription: detail.shortDescription || detail.short_description || "",
        content: detail.content || "",
        type: detail.type || "blog",
        status: detail.status || "draft",
        isFeatured: Boolean(detail.isFeatured ?? detail.is_featured),
        seoTitle: detail.seoTitle || detail.seo_title || "",
        seoDescription: detail.seoDescription || detail.seo_description || "",
        publishedAt: toInputDateTimeValue(detail.publishedAt || detail.published_at),
        thumbnailUrl: detail.thumbnailUrl || detail.thumbnail_url || "",
      });

      setEditImageFile(null);
      setEditImagePreviewUrl("");
      setEditPostModalOpen(true);
      setSuccessMessage(null);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(mapHttpErrorMessage(error));
    } finally {
      setLoadingEditId("");
    }
  };

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Quản lý blog</h1>
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

      {editPostModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Chỉnh sửa bài viết</p>
                <h2 className="mt-2 text-xl font-bold text-slate-900">#{editPostFormState.id} - {editPostFormState.title || "Bài viết"}</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditPostModalOpen(false);
                  setEditPostFormState(defaultEditPostFormState);
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

                const payload = {
                  title: editPostFormState.title.trim(),
                  shortDescription: editPostFormState.shortDescription.trim() || undefined,
                  content: editPostFormState.content.trim() || undefined,
                  type: editPostFormState.type,
                  status: editPostFormState.status,
                  isFeatured: editPostFormState.isFeatured,
                  seoTitle: editPostFormState.seoTitle.trim() || undefined,
                  seoDescription: editPostFormState.seoDescription.trim() || undefined,
                  publishedAt: editPostFormState.publishedAt ? new Date(editPostFormState.publishedAt).toISOString() : undefined,
                };

                if (!payload.title) {
                  setUpdateResultModal({
                    type: "error",
                    title: "Cập nhật thất bại",
                    message: "Vui lòng nhập tiêu đề bài viết.",
                  });
                  return;
                }

                try {
                  setIsUpdatingPost(true);
                  await adminPostsApi.update(editPostFormState.id, {
                    ...payload,
                    thumbnail: editImageFile,
                  });
                  setEditPostModalOpen(false);
                  setEditPostFormState(defaultEditPostFormState);
                  setEditImageFile(null);
                  setEditImagePreviewUrl("");
                  setSuccessMessage("Đã cập nhật bài viết.");
                  setErrorMessage(null);
                  setUpdateResultModal({
                    type: "success",
                    title: "Cập nhật thành công",
                    message: "Thông tin bài viết đã được cập nhật.",
                  });
                  await loadPosts();
                } catch (error) {
                  const message = mapHttpErrorMessage(error);
                  setErrorMessage(message);
                  setUpdateResultModal({
                    type: "error",
                    title: "Cập nhật thất bại",
                    message,
                  });
                } finally {
                  setIsUpdatingPost(false);
                }
              }}
            >
              <input
                placeholder="Tiêu đề"
                value={editPostFormState.title}
                onChange={(event) =>
                  setEditPostFormState((state) => ({ ...state, title: event.target.value }))
                }
                className="rounded-xl border border-slate-300 px-4 py-3"
              />

              <textarea
                placeholder="Mô tả ngắn"
                value={editPostFormState.shortDescription}
                onChange={(event) =>
                  setEditPostFormState((state) => ({ ...state, shortDescription: event.target.value }))
                }
                rows={2}
                className="rounded-xl border border-slate-300 px-4 py-3"
              />

              <textarea
                placeholder="Nội dung"
                value={editPostFormState.content}
                onChange={(event) =>
                  setEditPostFormState((state) => ({ ...state, content: event.target.value }))
                }
                rows={6}
                className="rounded-xl border border-slate-300 px-4 py-3"
              />

              <div className="grid gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setEditImageFile(event.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-white"
                />

                {editImagePreviewUrl || editPostFormState.thumbnailUrl ? (
                  <div className="grid gap-3 md:grid-cols-[180px_1fr]">
                    <img
                      src={editImagePreviewUrl || editPostFormState.thumbnailUrl}
                      alt="Thumbnail preview"
                      className="h-44 w-full rounded-2xl object-cover"
                    />
                    <div className="space-y-2 text-sm text-slate-700">
                      <p className="font-semibold">
                        {editImagePreviewUrl
                          ? "Ảnh mới sẽ được upload khi bấm cập nhật."
                          : "Đây là ảnh thumbnail hiện tại của bài viết."}
                      </p>
                      <p>
                        {editImagePreviewUrl
                          ? "Nếu muốn giữ ảnh cũ, hãy xóa lựa chọn file trước khi cập nhật."
                          : "Bạn có thể chọn ảnh mới để thay thế ảnh hiện tại."}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <input
                  type="datetime-local"
                  value={editPostFormState.publishedAt}
                  onChange={(event) =>
                    setEditPostFormState((state) => ({ ...state, publishedAt: event.target.value }))
                  }
                  className="rounded-xl border border-slate-300 px-4 py-3"
                />

                <select
                  value={editPostFormState.type}
                  onChange={(event) =>
                    setEditPostFormState((state) => ({ ...state, type: event.target.value }))
                  }
                  className="rounded-xl border border-slate-300 px-4 py-3"
                >
                  <option value="blog">blog</option>
                  <option value="review">review</option>
                  <option value="news">news</option>
                  <option value="comparison">comparison</option>
                  <option value="guide">guide</option>
                </select>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <select
                  value={editPostFormState.status}
                  onChange={(event) =>
                    setEditPostFormState((state) => ({ ...state, status: event.target.value }))
                  }
                  className="rounded-xl border border-slate-300 px-4 py-3"
                >
                  <option value="draft">draft</option>
                  <option value="published">published</option>
                  <option value="archived">archived</option>
                </select>

                <label className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={editPostFormState.isFeatured}
                    onChange={(event) =>
                      setEditPostFormState((state) => ({ ...state, isFeatured: event.target.checked }))
                    }
                  />
                  Featured
                </label>
              </div>

              <input
                placeholder="SEO title"
                value={editPostFormState.seoTitle}
                onChange={(event) =>
                  setEditPostFormState((state) => ({ ...state, seoTitle: event.target.value }))
                }
                className="rounded-xl border border-slate-300 px-4 py-3"
              />

              <textarea
                placeholder="SEO description"
                value={editPostFormState.seoDescription}
                onChange={(event) =>
                  setEditPostFormState((state) => ({ ...state, seoDescription: event.target.value }))
                }
                rows={2}
                className="rounded-xl border border-slate-300 px-4 py-3"
              />

              <div className="mt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditPostModalOpen(false);
                    setEditPostFormState(defaultEditPostFormState);
                    setEditImageFile(null);
                    setEditImagePreviewUrl("");
                  }}
                  className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPost}
                  className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {isUpdatingPost ? "Đang cập nhật..." : "Cập nhật"}
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
          setErrorMessage(null);
          setSuccessMessage(null);

          const payload = {
            title: formState.title.trim(),
            shortDescription: formState.shortDescription.trim() || undefined,
            content: formState.content.trim() || undefined,
            type: formState.type,
            status: formState.status,
            isFeatured: formState.isFeatured,
            seoTitle: formState.seoTitle.trim() || undefined,
            seoDescription: formState.seoDescription.trim() || undefined,
            publishedAt: formState.publishedAt ? new Date(formState.publishedAt).toISOString() : undefined,
          };

          if (!payload.title) {
            setErrorMessage("Vui lòng nhập tiêu đề bài viết.");
            return;
          }

          if (!imageFile) {
            setErrorMessage("Vui lòng chọn ảnh thumbnail trước khi tạo bài viết.");
            return;
          }

          try {
            setIsSubmitting(true);

            const created = await adminPostsApi.create({
              ...payload,
              status: "published",
              isFeatured: true,
              image: imageFile as File,
            });
            const createdId = String(created.id ?? "").trim();
            if (createdId) {
              setActiveRelationPostId(createdId);
              await loadPostRelations(createdId);
            }
            setSuccessMessage(
              "Tạo bài viết thành công. Bạn có thể gắn product/tag cho bài vừa tạo ở panel bên dưới."
            );

            resetForm();
            await loadPosts();
          } catch (error) {
            setErrorMessage(mapHttpErrorMessage(error));
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <h2 className="text-xl font-semibold">Tạo bài viết mới</h2>

        <input
          placeholder="Tiêu đề"
          value={formState.title}
          onChange={(event) => setFormState((state) => ({ ...state, title: event.target.value }))}
          className="rounded-xl border border-slate-300 px-4 py-3"
        />

        <textarea
          placeholder="Mô tả ngắn"
          value={formState.shortDescription}
          onChange={(event) => setFormState((state) => ({ ...state, shortDescription: event.target.value }))}
          rows={2}
          className="rounded-xl border border-slate-300 px-4 py-3"
        />

        <textarea
          placeholder="Nội dung"
          value={formState.content}
          onChange={(event) => setFormState((state) => ({ ...state, content: event.target.value }))}
          rows={6}
          className="rounded-xl border border-slate-300 px-4 py-3"
        />

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
                <p className="font-semibold">Ảnh sẽ được gửi trực tiếp cùng request tạo post.</p>
                <p>Không cần nhập thumbnail URL và thumbnail public ID thủ công nữa.</p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <input
            type="datetime-local"
            value={formState.publishedAt}
            onChange={(event) => setFormState((state) => ({ ...state, publishedAt: event.target.value }))}
            className="rounded-xl border border-slate-300 px-4 py-3"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-1">
          <select
            value={formState.type}
            onChange={(event) => setFormState((state) => ({ ...state, type: event.target.value }))}
            className="rounded-xl border border-slate-300 px-4 py-3"
          >
            <option value="blog">blog</option>
            <option value="review">review</option>
            <option value="news">news</option>
            <option value="comparison">comparison</option>
            <option value="guide">guide</option>
          </select>
        </div>

        <input
          placeholder="SEO title"
          value={formState.seoTitle}
          onChange={(event) => setFormState((state) => ({ ...state, seoTitle: event.target.value }))}
          className="rounded-xl border border-slate-300 px-4 py-3"
        />
        <textarea
          placeholder="SEO description"
          value={formState.seoDescription}
          onChange={(event) => setFormState((state) => ({ ...state, seoDescription: event.target.value }))}
          rows={2}
          className="rounded-xl border border-slate-300 px-4 py-3"
        />

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-slate-900 px-4 py-3 text-white disabled:opacity-60"
          >
            {isSubmitting ? "Đang lưu..." : "Tạo bài viết"}
          </button>
        </div>
      </form>

      <div className="grid gap-4">
        {sortedPosts.map((post) => {
          const id = String(post.id);
          const selectedProductKeyword = (productSearchByPost[id] || "").trim().toLowerCase();
          const selectableProducts = products.filter((item) => {
            if (!selectedProductKeyword) {
              return true;
            }
            return getProductName(item).toLowerCase().includes(selectedProductKeyword);
          });

          return (
            <article key={id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">#{id}</p>
                  <h2 className="mt-1 text-xl font-semibold">{post.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">{getPostDescription(post)}</p>
                  <p className="mt-2 text-xs text-slate-500">Slug: {post.slug}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const nextId = activeRelationPostId === id ? "" : id;
                      setActiveRelationPostId(nextId);
                      if (nextId) {
                        void loadPostRelations(nextId);
                      }
                    }}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  >
                    {activeRelationPostId === id ? "Ẩn panel gắn" : "Mở panel gắn"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void beginEditPost(id);
                    }}
                    disabled={loadingEditId === id}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  >
                    {loadingEditId === id ? "Đang tải..." : "Chỉnh sửa"}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!window.confirm(`Xóa bài viết \"${post.title}\"?`)) {
                        return;
                      }

                      try {
                        await adminPostsApi.remove(id);
                        setActiveRelationPostId((current) => (current === id ? "" : current));
                        setSuccessMessage("Đã xóa bài viết.");
                        await loadPosts();
                      } catch (error) {
                        setErrorMessage(mapHttpErrorMessage(error));
                      }
                    }}
                    className="rounded-xl border border-rose-300 px-3 py-2 text-sm text-rose-700"
                  >
                    Xóa
                  </button>
                </div>
              </div>

              {activeRelationPostId === id ? (
                <>
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Gắn sản phẩm</p>
                    <div className="mt-2 grid gap-3 md:grid-cols-4">
                      <input
                        placeholder="Tìm theo tên sản phẩm"
                        value={productSearchByPost[id] || ""}
                        onChange={(event) =>
                          setProductSearchByPost((state) => ({ ...state, [id]: event.target.value }))
                        }
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                      />

                      <select
                        value={attachProductIdByPost[id] || ""}
                        onChange={(event) =>
                          setAttachProductIdByPost((state) => ({ ...state, [id]: event.target.value }))
                        }
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm md:col-span-2"
                      >
                        <option value="">Chọn sản phẩm</option>
                        {selectableProducts.map((item) => (
                          <option key={String(item.id)} value={String(item.id)}>
                            #{item.id} - {getProductName(item)}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min={1}
                        placeholder="position"
                        value={attachPositionByPost[id] || ""}
                        onChange={(event) =>
                          setAttachPositionByPost((state) => ({ ...state, [id]: event.target.value }))
                        }
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          const productId = (attachProductIdByPost[id] || "").trim();
                          const positionText = (attachPositionByPost[id] || "").trim();
                          const position = positionText ? Number(positionText) : undefined;

                          if (!productId) {
                            setErrorMessage("Vui lòng chọn product trước khi gắn.");
                            return;
                          }

                          if (position !== undefined && (!Number.isFinite(position) || position <= 0)) {
                            setErrorMessage("Position phải là số dương.");
                            return;
                          }

                          try {
                            await adminPostsApi.addProduct(id, { productId, position });
                            setSuccessMessage("Đã gắn product vào bài viết.");
                            await loadPostRelations(id);
                          } catch (error) {
                            setErrorMessage(mapHttpErrorMessage(error));
                          }
                        }}
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                      >
                        Gắn product
                      </button>
                    </div>

                    <div className="mt-3 space-y-2">
                      {(postProductsByPost[id] || []).length > 0 ? (
                        (postProductsByPost[id] || []).map((item) => (
                          <div
                            key={`${item.postProductId}-${item.productId}-${item.productName}`}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                          >
                            <span>
                              {item.productName} {item.position ? `(position: ${item.position})` : ""}
                            </span>
                            <button
                              type="button"
                              disabled={!item.postProductId}
                              onClick={async () => {
                                if (!item.postProductId) {
                                  setErrorMessage("Thiếu postProductId nên không thể xóa item này.");
                                  return;
                                }

                                try {
                                  await adminPostsApi.removeProduct(item.postProductId);
                                  setSuccessMessage("Đã xóa liên kết product khỏi bài viết.");
                                  await loadPostRelations(id);
                                } catch (error) {
                                  setErrorMessage(mapHttpErrorMessage(error));
                                }
                              }}
                              className="rounded-lg border border-rose-300 px-2 py-1 text-xs text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Remove
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">Chưa có product nào được gắn.</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Gắn tag</p>
                    <div className="mt-2 grid gap-3 md:grid-cols-3">
                      <select
                        value={attachTagIdByPost[id] || ""}
                        onChange={(event) => setAttachTagIdByPost((state) => ({ ...state, [id]: event.target.value }))}
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm md:col-span-2"
                      >
                        <option value="">Chọn tag</option>
                        {tags.map((tag) => (
                          <option key={String(tag.id)} value={String(tag.id)}>
                            #{tag.id} - {tag.name}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={async () => {
                          const tagId = (attachTagIdByPost[id] || "").trim();
                          if (!tagId) {
                            setErrorMessage("Vui lòng chọn tag trước khi gắn.");
                            return;
                          }

                          try {
                            await adminPostsApi.addTag(id, tagId);
                            setSuccessMessage("Đã gắn tag vào bài viết.");
                            await loadPostRelations(id);
                          } catch (error) {
                            setErrorMessage(mapHttpErrorMessage(error));
                          }
                        }}
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                      >
                        Gắn tag
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {(postTagsByPost[id] || []).length > 0 ? (
                        (postTagsByPost[id] || []).map((item) => (
                          <span
                            key={`${item.tagId}-${item.tagName}`}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700"
                          >
                            {item.tagName}
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await adminPostsApi.removeTag(id, item.tagId);
                                  setSuccessMessage("Đã xóa tag khỏi bài viết.");
                                  await loadPostRelations(id);
                                } catch (error) {
                                  setErrorMessage(mapHttpErrorMessage(error));
                                }
                              }}
                              className="rounded-md border border-rose-300 px-1.5 py-0.5 text-[10px] text-rose-700"
                            >
                              Remove
                            </button>
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">Chưa có tag nào được gắn.</p>
                      )}
                    </div>
                  </div>

                  {relationLoadingByPost[id] ? (
                    <p className="mt-3 text-sm text-slate-500">Đang tải danh sách đã gắn...</p>
                  ) : null}
                </>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
