import { ApiError, mapStatusToReason } from "@/lib/api/errors";

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

interface RequestOptions {
  method: "GET" | "POST";
  path: string;
  body?: unknown;
}

export async function apiRequest<T>({ method, path, body }: RequestOptions): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      // No cookies/auth exist on this API — never send credentials.
      credentials: "omit",
    });
  } catch {
    throw new ApiError("network", null, "Could not reach the server");
  }

  if (!response.ok) {
    const reason = mapStatusToReason(response.status);
    let message = "An unknown error occurred";
    try {
      const data = (await response.json()) as { detail?: string };
      if (data.detail) message = data.detail;
    } catch {
      // no JSON body — fall back to default message
    }
    throw new ApiError(reason, response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
