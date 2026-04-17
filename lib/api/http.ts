import type { ApiErrorPayload } from "@/lib/api/types";

const ensureBaseUrl = () => {
  if (typeof window !== "undefined") {
    return "";
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (appUrl) {
    return appUrl.replace(/\/$/, "");
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/$/, "")}`;
  }

  return "https://api.taphoadeal.com";
};

export class HttpError extends Error {
  status: number;
  payload?: ApiErrorPayload;

  constructor(status: number, message: string, payload?: ApiErrorPayload) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.payload = payload;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string;
};

const tryParseJson = async (response: Response) => {
  const text = await response.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text) as ApiErrorPayload | Record<string, unknown>;
  } catch {
    return undefined;
  }
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, token, headers, ...rest } = options;
  const baseUrl = ensureBaseUrl();
  const url = path.startsWith("http") ? path : `${baseUrl}${path}`;

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const requestHeaders = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const response = await fetch(url, {
    ...rest,
    headers: requestHeaders,
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    cache: "no-store",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const parsed = await tryParseJson(response);

  if (!response.ok) {
    const payload = parsed as ApiErrorPayload | undefined;
    throw new HttpError(
      response.status,
      payload?.message || `Request failed with status ${response.status}`,
      payload
    );
  }

  return (parsed ?? {}) as T;
}
