import { apiRequest } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";
import type {
  AdminPostWritePayload,
  AdminLoginResponse,
  AdminProductWritePayload,
  AdminUser,
  AffiliateLink,
  BlogPostDetail,
  BlogPostListItem,
  Category,
  Tag,
  ProductDetail,
  ProductImage,
  ProductListItem,
  ProductRecommendation,
} from "@/lib/api/types";

type AdminRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

const withAdminToken = <T>(path: string, init?: AdminRequestOptions) => {
  const token = getAccessToken();
  return apiRequest<T>(path, {
    ...init,
    token: token ?? undefined,
  });
};

export const adminAuthApi = {
  login: (payload: { email: string; password: string }) =>
    apiRequest<AdminLoginResponse>("/api/auth/login", {
      method: "POST",
      body: payload,
    }),
  me: () => withAdminToken<AdminUser>("/api/admin-auth/me"),
};

export const adminsApi = {
  list: () => withAdminToken<AdminUser[]>("/api/admins"),
  getById: (id: string | number) => withAdminToken<AdminUser>(`/api/admins/${id}`),
  create: (payload: { email: string; password: string; full_name?: string; role?: string }) =>
    withAdminToken<AdminUser>("/api/admins", { method: "POST", body: payload }),
  update: (id: string | number, payload: Partial<AdminUser>) =>
    withAdminToken<AdminUser>(`/api/admins/${id}`, { method: "PUT", body: payload }),
  toggleActive: (id: string | number) =>
    withAdminToken<void>(`/api/admins/${id}/toggle-active`, { method: "PATCH" }),
};

export const adminCategoriesApi = {
  list: () => withAdminToken<Category[]>("/api/categories"),
  create: (payload: { name: string; description?: string }) =>
    withAdminToken<Category>("/api/categories", { method: "POST", body: payload }),
  update: (id: string | number, payload: Partial<Category>) =>
    withAdminToken<Category>(`/api/categories/${id}`, { method: "PUT", body: payload }),
  remove: (id: string | number) => withAdminToken<void>(`/api/categories/${id}`, { method: "DELETE" }),
};

export const adminTagsApi = {
  list: () => withAdminToken<Tag[]>("/api/tags"),
};

export const adminProductsApi = {
  list: () => withAdminToken<ProductListItem[]>("/api/products"),
  getById: (id: string | number) => withAdminToken<ProductDetail>(`/api/products/${id}`),
  create: (
    payload: AdminProductWritePayload & {
      image: File;
    }
  ) => {
    const searchParams = new URLSearchParams();

    searchParams.set("CategoryId", String(payload.categoryId));
    searchParams.set("Name", payload.name);

    if (payload.shortDescription) searchParams.set("ShortDescription", payload.shortDescription);
    if (payload.description) searchParams.set("Description", payload.description);
    if (payload.originalPrice !== undefined) searchParams.set("OriginalPrice", String(payload.originalPrice));
    if (payload.salePrice !== undefined) searchParams.set("SalePrice", String(payload.salePrice));
    if (payload.affiliateLink) searchParams.set("AffiliateLink", payload.affiliateLink);
    if (payload.sourcePlatform) searchParams.set("SourcePlatform", payload.sourcePlatform);
    if (payload.isRecommended !== undefined) searchParams.set("IsRecommended", String(payload.isRecommended));
    if (payload.isFeatured !== undefined) searchParams.set("IsFeatured", String(payload.isFeatured));
    if (payload.isActive !== undefined) searchParams.set("IsActive", String(payload.isActive));

    const formData = new FormData();
    formData.append("Image", payload.image);

    return withAdminToken<ProductDetail>(`/api/products?${searchParams.toString()}`, {
      method: "POST",
      body: formData,
    });
  },
  update: (
    id: string | number,
    payload: Partial<AdminProductWritePayload> & {
      image?: File | null;
    }
  ) => {
    if (!payload.image) {
      return withAdminToken<ProductDetail>(`/api/products/${id}`, { method: "PUT", body: payload });
    }

    const searchParams = new URLSearchParams();

    if (payload.categoryId !== undefined) searchParams.set("CategoryId", String(payload.categoryId));
    if (payload.name !== undefined) searchParams.set("Name", payload.name);
    if (payload.shortDescription !== undefined) searchParams.set("ShortDescription", payload.shortDescription || "");
    if (payload.description !== undefined) searchParams.set("Description", payload.description || "");
    if (payload.originalPrice !== undefined) searchParams.set("OriginalPrice", String(payload.originalPrice));
    if (payload.salePrice !== undefined) searchParams.set("SalePrice", String(payload.salePrice));
    if (payload.affiliateLink !== undefined) searchParams.set("AffiliateLink", payload.affiliateLink || "");
    if (payload.sourcePlatform !== undefined) searchParams.set("SourcePlatform", payload.sourcePlatform);
    if (payload.isRecommended !== undefined) searchParams.set("IsRecommended", String(payload.isRecommended));
    if (payload.isFeatured !== undefined) searchParams.set("IsFeatured", String(payload.isFeatured));
    if (payload.isActive !== undefined) searchParams.set("IsActive", String(payload.isActive));

    const formData = new FormData();
    formData.append("Image", payload.image);

    const query = searchParams.toString();
    const path = query ? `/api/products/${id}?${query}` : `/api/products/${id}`;
    return withAdminToken<ProductDetail>(path, { method: "PUT", body: formData });
  },
  publish: (id: string | number) =>
    withAdminToken<void>(`/api/products/${id}/publish`, { method: "PATCH" }),
  archive: (id: string | number) =>
    withAdminToken<void>(`/api/products/${id}/archive`, { method: "PATCH" }),
  remove: (id: string | number) => withAdminToken<void>(`/api/products/${id}`, { method: "DELETE" }),
};

export const adminAffiliateLinksApi = {
  listByProduct: (productId: string | number) =>
    withAdminToken<AffiliateLink[]>(`/api/products/${productId}/affiliate-links`),
  createByProduct: (
    productId: string | number,
    payload: {
      platform: "shopee" | "tiktok_shop";
      label?: string;
      affiliate_url: string;
      deep_link?: string;
      is_primary?: boolean;
      is_active?: boolean;
    }
  ) =>
    withAdminToken<AffiliateLink>(`/api/products/${productId}/affiliate-links`, {
      method: "POST",
      body: payload,
    }),
  update: (id: string | number, payload: Partial<AffiliateLink>) =>
    withAdminToken<AffiliateLink>(`/api/affiliate-links/${id}`, {
      method: "PUT",
      body: payload,
    }),
  setPrimary: (id: string | number) =>
    withAdminToken<void>(`/api/affiliate-links/${id}/primary`, { method: "PATCH" }),
  remove: (id: string | number) =>
    withAdminToken<void>(`/api/affiliate-links/${id}`, { method: "DELETE" }),
};

export const adminProductImagesApi = {
  listByProduct: (productId: string | number) =>
    withAdminToken<ProductImage[]>(`/api/products/${productId}/images`),
  createByProduct: (
    productId: string | number,
    payload: {
      image_url: string;
      thumbnail_url?: string;
      alt_text?: string;
      storage_key?: string;
      width?: number;
      height?: number;
      sort_order?: number;
    }
  ) =>
    withAdminToken<ProductImage>(`/api/products/${productId}/images`, {
      method: "POST",
      body: payload,
    }),
  update: (id: string | number, payload: Partial<ProductImage>) =>
    withAdminToken<ProductImage>(`/api/product-images/${id}`, {
      method: "PUT",
      body: payload,
    }),
  setCover: (id: string | number) =>
    withAdminToken<void>(`/api/product-images/${id}/cover`, { method: "PATCH" }),
  remove: (id: string | number) => withAdminToken<void>(`/api/product-images/${id}`, { method: "DELETE" }),
};

export const adminProductRecommendationsApi = {
  list: () => withAdminToken<ProductRecommendation[]>("/api/product-recommendations"),
  create: (payload: {
    productId: string | number;
    title: string;
    position: number;
    isActive?: boolean;
    startAt?: string | null;
    endAt?: string | null;
  }) => {
    const body = {
      productId: payload.productId,
      title: payload.title,
      position: payload.position,
      isActive: payload.isActive ?? true,
      startAt: payload.startAt || null,
      endAt: payload.endAt || null,
    };
    return withAdminToken<ProductRecommendation>("/api/product-recommendations", {
      method: "POST",
      body,
    });
  },
  update: (id: string | number, payload: Partial<ProductRecommendation>) =>
    withAdminToken<ProductRecommendation>(`/api/product-recommendations/${id}`, {
      method: "PUT",
      body: payload,
    }),
  remove: (id: string | number) =>
    withAdminToken<void>(`/api/product-recommendations/${id}`, { method: "DELETE" }),
};

export const adminPostsApi = {
  list: () => withAdminToken<BlogPostListItem[]>("/api/posts"),
  getById: (id: string | number) => withAdminToken<BlogPostDetail>(`/api/posts/${id}`),
  create: (
    payload: Omit<AdminPostWritePayload, "thumbnailUrl" | "thumbnailPublicId"> & {
      thumbnail?: File;
      image: File;
    }
  ) => {
    const formData = new FormData();
    formData.append("Title", payload.title);
    if (payload.shortDescription !== undefined) formData.append("ShortDescription", payload.shortDescription || "");
    if (payload.content !== undefined) formData.append("Content", payload.content || "");
    if (payload.type !== undefined) formData.append("Type", payload.type);
    if (payload.status !== undefined) formData.append("Status", payload.status);
    if (payload.isFeatured !== undefined) formData.append("IsFeatured", String(payload.isFeatured));
    if (payload.seoTitle !== undefined) formData.append("SeoTitle", payload.seoTitle || "");
    if (payload.seoDescription !== undefined) formData.append("SeoDescription", payload.seoDescription || "");
    if (payload.publishedAt !== undefined) formData.append("PublishedAt", payload.publishedAt || "");

    const thumbnail = payload.thumbnail ?? payload.image;
    formData.append("Thumbnail", thumbnail);

    return withAdminToken<BlogPostDetail>("/api/posts", {
      method: "POST",
      body: formData,
    });
  },
  update: (
    id: string | number,
    payload: Partial<Omit<AdminPostWritePayload, "thumbnailUrl" | "thumbnailPublicId">> & {
      thumbnail?: File | null;
      image?: File | null;
    }
  ) => {
    const formData = new FormData();
    if (payload.title !== undefined) formData.append("Title", payload.title);
    if (payload.shortDescription !== undefined) formData.append("ShortDescription", payload.shortDescription || "");
    if (payload.content !== undefined) formData.append("Content", payload.content || "");
    if (payload.type !== undefined) formData.append("Type", payload.type);
    if (payload.status !== undefined) formData.append("Status", payload.status);
    if (payload.isFeatured !== undefined) formData.append("IsFeatured", String(payload.isFeatured));
    if (payload.seoTitle !== undefined) formData.append("SeoTitle", payload.seoTitle || "");
    if (payload.seoDescription !== undefined) formData.append("SeoDescription", payload.seoDescription || "");
    if (payload.publishedAt !== undefined) formData.append("PublishedAt", payload.publishedAt || "");

    const thumbnail = payload.thumbnail ?? payload.image;
    if (thumbnail) {
      formData.append("Thumbnail", thumbnail);
    }

    return withAdminToken<BlogPostDetail>(`/api/posts/${id}`, { method: "PUT", body: formData });
  },
  remove: (id: string | number) => withAdminToken<void>(`/api/posts/${id}`, { method: "DELETE" }),
  addProduct: (postId: string | number, payload: { productId: string | number; position?: number }) =>
    withAdminToken<void>(`/api/posts/${postId}/products`, { method: "POST", body: payload }),
  removeProduct: (postProductId: string | number) =>
    withAdminToken<void>(`/api/posts/post-products/${postProductId}`, { method: "DELETE" }),
  addTag: (postId: string | number, tagId: string | number) =>
    withAdminToken<void>(`/api/posts/${postId}/tags/${tagId}`, { method: "POST" }),
  removeTag: (postId: string | number, tagId: string | number) =>
    withAdminToken<void>(`/api/posts/${postId}/tags/${tagId}`, { method: "DELETE" }),
};
