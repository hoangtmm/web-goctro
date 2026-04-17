import type { AdminLoginResponse, AdminUser } from "@/lib/api/types";

const STORAGE_KEY = "goctro_admin_session";

type SessionData = {
  token: string;
  admin: AdminUser;
};

let memorySession: SessionData | null = null;

const isClient = typeof window !== "undefined";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64Payload = token.split(".")[1];
    if (!base64Payload) return null;
    const normalized = base64Payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getJwtClaims(token: string) {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  return {
    role: payload.role as string | undefined,
    nameidentifier: payload.nameidentifier as string | undefined,
    email: payload.email as string | undefined,
    full_name: payload.full_name as string | undefined,
  };
}

export function getSession(): SessionData | null {
  if (memorySession) {
    return memorySession;
  }

  if (!isClient) {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as SessionData;
    memorySession = parsed;
    return parsed;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function setSession(data: AdminLoginResponse) {
  const nextSession: SessionData = {
    token: data.accessToken,
    admin: {
      id: String(data.adminId),
      email: data.email,
      username: data.username,
      full_name: data.fullName,
      role: data.role,
    },
  };

  memorySession = nextSession;

  if (isClient) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
  }
}

export function clearSession() {
  memorySession = null;

  if (isClient) {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export function getAccessToken() {
  return getSession()?.token ?? null;
}
