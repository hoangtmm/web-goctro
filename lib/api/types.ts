export const PLATFORM_VALUES = ["shopee", "tiktok_shop"] as const;
export type Platform = (typeof PLATFORM_VALUES)[number];

export const PRODUCT_STATUS_VALUES = ["draft", "published", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUS_VALUES)[number];

export const POST_STATUS_VALUES = ["draft", "published", "archived"] as const;
export type PostStatus = (typeof POST_STATUS_VALUES)[number];

export const POST_TYPE_VALUES = ["blog", "review", "news", "comparison", "guide"] as const;
export type PostType = (typeof POST_TYPE_VALUES)[number];

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  productCount?: number;
  product_count?: number;
  created_at?: string;
  updated_at?: string;
};

export type Tag = {
  id: string | number;
  name: string;
  slug?: string | null;
  description?: string | null;
};

export type ProductListItem = {
  id: string;
  name?: string;
  title: string;
  slug: string;
  shortDescription?: string | null;
  short_description?: string | null;
  price_reference?: string | null;
  description?: string | null;
  originalPrice?: number | string | null;
  original_price?: number | string | null;
  salePrice?: number | string | null;
  sale_price?: number | string | null;
  affiliateLink?: string | null;
  sourcePlatform?: string | null;
  imageUrl?: string | null;
  image_url?: string | null;
  imagePublicId?: string | null;
  isRecommended?: boolean;
  category_id: string;
  category_name?: string | null;
  is_featured?: boolean;
  isFeatured?: boolean;
  is_active?: boolean;
  isActive?: boolean;
  review_score?: number | null;
  published_at?: string | null;
  createdAt?: string;
  updatedAt?: string;
  clickCount?: number;
  viewCount?: number;
  platform: Platform;
  status: ProductStatus;
};

export type ProductImage = {
  id: string;
  image_url: string;
  thumbnail_url?: string | null;
  alt_text?: string | null;
  storage_key?: string | null;
  width?: number | null;
  height?: number | null;
  is_cover: boolean;
  sort_order: number;
};

export type AffiliateLink = {
  id: string;
  platform: Platform;
  label?: string | null;
  affiliate_url: string;
  deep_link?: string | null;
  is_primary: boolean;
  is_active: boolean;
  click_count?: number;
};

export type ProductDetail = ProductListItem & {
  content?: string | null;
  pros?: string | null;
  cons?: string | null;
  brand?: string | null;
  model?: string | null;
  original_price?: string | null;
  currency?: string | null;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
  images: ProductImage[];
  affiliate_links: AffiliateLink[];
};

export type ProductRecommendation = {
  id: number | string;
  productId: number | string;
  title: string;
  position: number;
  isActive: boolean;
  startAt?: string | null;
  endAt?: string | null;
  createdAt?: string;
};

export type BlogPostListItem = {
  id: string | number;
  slug: string;
  title: string;
  shortDescription?: string | null;
  short_description?: string | null;
  thumbnailUrl?: string | null;
  thumbnail_url?: string | null;
  thumbnailPublicId?: string | null;
  thumbnail_public_id?: string | null;
  type?: string | null;
  status?: string | null;
  isFeatured?: boolean;
  is_featured?: boolean;
  publishedAt?: string | null;
  published_at?: string | null;
  createdAt?: string | null;
  created_at?: string | null;
  updatedAt?: string | null;
  updated_at?: string | null;
};

export type BlogPostDetail = BlogPostListItem & {
  content?: string | null;
  seoTitle?: string | null;
  seo_title?: string | null;
  seoDescription?: string | null;
  seo_description?: string | null;
  postProducts?: Array<{
    id?: string | number;
    postProductId?: string | number;
    post_product_id?: string | number;
    productId?: string | number;
    product_id?: string | number;
    position?: number | null;
    sortOrder?: number | null;
    sort_order?: number | null;
    product?: ProductListItem | null;
    productName?: string | null;
    product_name?: string | null;
  }>;
  products?: Array<{
    id?: string | number;
    postProductId?: string | number;
    post_product_id?: string | number;
    productId?: string | number;
    product_id?: string | number;
    position?: number | null;
    sortOrder?: number | null;
    sort_order?: number | null;
    product?: ProductListItem | null;
    productName?: string | null;
    product_name?: string | null;
  }>;
  tags?: Array<{
    id?: string | number;
    tagId?: string | number;
    tag_id?: string | number;
    name?: string | null;
    tagName?: string | null;
    tag_name?: string | null;
  }>;
};

export type AdminProductWritePayload = {
  categoryId: string | number;
  name: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  originalPrice?: number;
  salePrice?: number;
  affiliateLink?: string;
  sourcePlatform?: Platform;
  imageUrl?: string;
  imagePublicId?: string;
  isRecommended?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  reviewScore?: number;
  displayOrder?: number;
};

export type AdminPostWritePayload = {
  title: string;
  shortDescription?: string;
  content?: string;
  thumbnailUrl?: string;
  thumbnailPublicId?: string;
  type?: PostType | string;
  status?: PostStatus | string;
  isFeatured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: string;
};



export type AdminUser = {
  id: string;
  email: string;
  username?: string | null;
  full_name?: string | null;
  role: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type AdminLoginResponse = {
  accessToken: string;
  tokenType: string;
  adminId: string | number;
  username: string;
  email: string;
  role: string;
  fullName: string;
};

export type ApiFieldErrors = Record<string, string[] | string>;

export type ApiErrorPayload = {
  message?: string;
  errors?: ApiFieldErrors;
};
