import { apiRequest } from "@/lib/api/http";
import type {
  Category,
  ProductDetail,
  ProductRecommendation,
  ProductListItem,
} from "@/lib/api/types";

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

  getAffiliateRedirectUrl: (id: string | number) => `/api/affiliate-links/${id}/redirect`,
};
