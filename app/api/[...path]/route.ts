import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const getBackendBaseUrl = () => {
  const value =
    process.env.API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    "https://localhost:7132";

  return value.replace(/\/$/, "");
};

const shouldAllowInsecureLocalTls = (targetUrl: string) =>
  process.env.NODE_ENV === "development" &&
  /^https:\/\/localhost(?::\d+)?/i.test(targetUrl);

async function proxy(request: NextRequest, params: Promise<{ path: string[] }>) {
  const { path } = await params;
  const backendBase = getBackendBaseUrl();
  const incoming = new URL(request.url);
  const upstreamUrl = `${backendBase}/api/${path.join("/")}${incoming.search}`;

  if (shouldAllowInsecureLocalTls(upstreamUrl)) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }

  const outgoingHeaders = new Headers();
  request.headers.forEach((value, key) => {
    if (
      [
        "host",
        "connection",
        "content-length",
        "origin",
        "referer",
        "sec-fetch-dest",
        "sec-fetch-mode",
        "sec-fetch-site",
        "sec-fetch-user",
        "sec-ch-ua",
        "sec-ch-ua-mobile",
        "sec-ch-ua-platform",
      ].includes(key.toLowerCase())
    ) {
      return;
    }
    outgoingHeaders.set(key, value);
  });

  const hasBody = !["GET", "HEAD"].includes(request.method);

  let upstreamResponse: Response;
  try {
    const body = hasBody ? await request.arrayBuffer() : undefined;

    upstreamResponse = await fetch(upstreamUrl, {
      method: request.method,
      headers: outgoingHeaders,
      body,
      redirect: "manual",
      cache: "no-store",
    });
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof Error
            ? `Proxy to backend failed: ${error.message}`
            : "Proxy to backend failed",
      },
      { status: 502 }
    );
  }

  const responseHeaders = new Headers();
  upstreamResponse.headers.forEach((value, key) => {
    if (["content-encoding", "transfer-encoding", "connection"].includes(key.toLowerCase())) {
      return;
    }
    responseHeaders.set(key, value);
  });

  return new Response(await upstreamResponse.arrayBuffer(), {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, context.params);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, context.params);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, context.params);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, context.params);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, context.params);
}
