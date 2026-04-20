import { apiRequest } from "@/lib/api/http";
import type {
  BlogPostDetail,
  BlogPostListItem,
  Category,
  ProductDetail,
  ProductRecommendation,
  ProductListItem,
} from "@/lib/api/types";

const normalizeSlug = (value: string) => value.trim().toLowerCase();

const isPublishedPost = (post: BlogPostListItem) => {
  const status = String(post.status || "").toLowerCase();
  return !status || status === "published";
};

const loadBlogPosts = async () => {
  try {
    return await apiRequest<BlogPostListItem[]>('/api/posts/published');
  } catch {
    const posts = await apiRequest<BlogPostListItem[]>('/api/posts');
    return posts.filter(isPublishedPost);
  }
};

type ProductQuery = {
  categoryId?: string | number;
  status?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
};

const buildProductsPath = (query?: ProductQuery) => {
  if (!query) {
    return "/api/products";
  }

  const params = new URLSearchParams();

  if (query.categoryId !== undefined && query.categoryId !== "") {
    params.set("categoryId", String(query.categoryId));
  }
  if (query.status) {
    params.set("status", query.status);
  }
  if (query.page !== undefined) {
    params.set("page", String(query.page));
  }
  if (query.pageSize !== undefined) {
    params.set("pageSize", String(query.pageSize));
  }
  if (query.sort) {
    params.set("sort", query.sort);
  }

  const search = params.toString();
  return search ? `/api/products?${search}` : "/api/products";
};

export const publicApi = {
  getCategories: () => apiRequest<Category[]>("/api/categories"),
  getCategoryById: (id: string | number) => apiRequest<Category>(`/api/categories/${id}`),
  getActiveProductRecommendations: () =>
    apiRequest<ProductRecommendation[]>("/api/product-recommendations/active"),
  getProducts: (query?: ProductQuery) => apiRequest<ProductListItem[]>(buildProductsPath(query)),
  getProductById: (id: string | number) => apiRequest<ProductDetail>(`/api/products/${id}`),
  getProductBySlug: (slug: string) =>
    apiRequest<ProductDetail>(`/api/products/slug/${slug}`),

  getPosts: async () => loadBlogPosts(),
  getPostById: (id: string | number) => apiRequest<BlogPostDetail>(`/api/posts/${id}`),
  getPostBySlug: async (slug: string) => {
    const normalized = normalizeSlug(slug);

    const posts = await loadBlogPosts();
    const matched = posts.find((post) => normalizeSlug(post.slug || "") === normalized);

    if (!matched) {
      throw new Error("Post not found");
    }

    return apiRequest<BlogPostDetail>(`/api/posts/${matched.id}`);
  },

  getAffiliateRedirectUrl: (id: string | number) => `/api/affiliate-links/${id}/redirect`,
};
