# Góc Trọ Tối Ưu

Website affiliate review cho sản phẩm phòng trọ, góc học tập và đồ dùng nhỏ gọn.  
Phong cách giao diện hiện tại đi theo hướng clean, đơn giản, dễ đọc trên mobile và phù hợp mô hình affiliate cho `Shopee` và `TikTok Shop`.

## Tổng quan

- Xây dựng bằng `Next.js 16`, `React 19`, `TypeScript`
- Sử dụng `App Router`
- Styling bằng `Tailwind CSS v4`
- Nội dung mẫu hiện gồm:
  - Trang chủ affiliate review
  - Trang danh sách bài viết
  - Trang danh mục
  - Trang chi tiết bài viết

## Mục tiêu dự án

Website này hướng tới:

- Review ngắn gọn, rõ ràng, dễ đọc
- Tập trung đúng nhu cầu người thuê trọ, sinh viên, người ở studio nhỏ
- Điều hướng người dùng từ nội dung review sang link mua hàng affiliate
- Tối ưu hiển thị cho `mobile`, `laptop`, `PC`, `Mac`

## Chạy dự án

Yêu cầu:

- `Node.js 20+` khuyến nghị
- `npm`

Cài dependencies:

```bash
npm install
```

Chạy môi trường development:

```bash
npm run dev
```

Mở trình duyệt tại:

```txt
https://api.taphoadeal.com
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Cấu trúc chính

```txt
app/
  layout.tsx
  page.tsx
  globals.css
  blog/
  danh-muc/
components/
  Header.tsx
  Footer.tsx
  BlogFilters.tsx
lib/
  posts.ts
public/
```

## Kiến trúc API đã tích hợp

- Public API:
  - `GET /api/categories`
  - `GET /api/categories/{id}`
  - `GET /api/categories/slug/{slug}`
  - `GET /api/products`
  - `GET /api/products/{id}`
  - `GET /api/products/slug/{slug}`
  - `GET /api/affiliate-links/{id}/redirect`
- Admin API:
  - `POST /api/admin-auth/login`
  - `GET /api/admin-auth/me`
  - `GET/POST/PUT/PATCH /api/admins...`
  - `GET/POST/PUT/PATCH /api/admin/products...`
  - `GET/POST/PUT/PATCH/DELETE /api/admin/products/{productId}/images...`
  - `GET/POST/PUT/PATCH/DELETE /api/admin/products/{productId}/affiliate-links...`

## Environment Variables

Tạo file `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=https://api.taphoadeal.com
NEXT_PUBLIC_APP_URL=https://api.taphoadeal.com
NEXT_PUBLIC_API_BASE_URL=https://api.taphoadeal.com
API_BASE_URL=https://api.taphoadeal.com
```

- Nếu không khai báo `NEXT_PUBLIC_API_BASE_URL`, frontend sẽ gọi API cùng origin (`/api/...`).

## Chuẩn bị production

- Thiết lập domain thật cho `NEXT_PUBLIC_SITE_URL`
- Thiết lập API backend thật cho `API_BASE_URL`
- Kiểm tra `robots.txt` và `sitemap.xml` đã sinh đúng domain production
- Kiểm tra thẻ SEO: title, description, canonical, OpenGraph, Twitter Card
- Đảm bảo route admin không index bởi máy tìm kiếm

## Enum dùng chung FE

- `platform`: `shopee`, `tiktok_shop`
- `status`: `draft`, `published`, `archived`

## Validate FE đã áp dụng

- `affiliate_url`, `deep_link`, `image_url`, `thumbnail_url`: phải là absolute URL
- `review_score`: từ `0` đến `10`
- `display_order`, `sort_order`: không âm
- Email admin đúng format, password tạo admin tối thiểu `6` ký tự

## Luồng chính đã có

- Public:
  - Trang danh mục: `/danh-muc`
  - Trang danh sách sản phẩm: `/blog`
  - Trang chi tiết sản phẩm theo slug: `/blog/[slug]`
  - Nút mua đi qua redirect endpoint để track click
- Admin CMS:
  - Login: `/admin/login`
  - Products dashboard: `/admin`
  - Product edit: `/admin/products/[id]/edit`
  - Categories: `/admin/categories`
  - Admin users: `/admin/admins`
  - Product images: `/admin/products/[id]/images`
  - Affiliate links: `/admin/products/[id]/affiliate-links`

## Ghi chú phát triển

- Dự án đang dùng phiên bản `Next.js 16.2.2`
- Trong repo có ghi chú nội bộ yêu cầu đọc guide trong `node_modules/next/dist/docs/` trước khi thay đổi theo thói quen của Next cũ
- Font đang dùng `next/font/google`
- Hình ảnh remote hiện cho phép từ `images.unsplash.com`

## Định hướng nên làm tiếp

- Đồng bộ giao diện trang `blog` và `danh-muc` theo style affiliate hiện tại
- Thêm CTA mua hàng rõ hơn cho từng bài viết
- Thêm schema SEO cho bài review sản phẩm
- Tách dữ liệu bài viết ra CMS hoặc file markdown/json

## License

Dự án nội bộ, chưa thiết lập license công khai.
