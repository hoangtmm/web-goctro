import { HttpError } from "@/lib/api/http";

export function mapHttpErrorMessage(error: unknown) {
  if (!(error instanceof HttpError)) {
    const text = error instanceof Error ? error.message : "";

    if (
      /Failed to fetch|fetch failed|ENOTFOUND|ECONNREFUSED|ECONNRESET/i.test(text)
    ) {
      return "Không kết nối được API. Kiểm tra backend đang chạy và biến NEXT_PUBLIC_API_BASE_URL.";
    }

    if (/Invalid URL|Failed to parse URL/i.test(text)) {
      return "URL API chưa hợp lệ. Vui lòng kiểm tra NEXT_PUBLIC_API_BASE_URL (hoặc NEXT_PUBLIC_APP_URL).";
    }

    return "Không thể gọi API. Vui lòng kiểm tra cấu hình môi trường và thử lại.";
  }

  if (error.status === 401) {
    return "Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.";
  }

  if (error.status === 403) {
    return "Bạn không có quyền thực hiện thao tác này.";
  }

  if (error.status === 404) {
    return "Không tìm thấy dữ liệu yêu cầu.";
  }

  if (error.status === 400) {
    return error.payload?.message || "Dữ liệu chưa hợp lệ. Vui lòng kiểm tra lại.";
  }

  return error.payload?.message || `Yêu cầu thất bại (${error.status}).`;
}

export function mapFieldErrors(error: unknown) {
  if (!(error instanceof HttpError)) {
    return null;
  }

  return error.payload?.errors ?? null;
}
