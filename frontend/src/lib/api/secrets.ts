import { apiRequest } from "@/lib/api/client";
import type { SecretCreate, SecretOut, SecretResponse } from "@/lib/api/types";

export function createSecret(data: SecretCreate): Promise<SecretResponse> {
  return apiRequest<SecretResponse>({ method: "POST", path: "/api/v1/secrets/", body: data });
}

/**
 * Consumes one view of the secret — this is a destructive, non-idempotent
 * call. Only invoke it from an explicit user action (never a mount effect
 * or a route loader), see hooks/useRevealSecret.ts.
 */
export function revealSecret(id: string): Promise<SecretOut> {
  return apiRequest<SecretOut>({ method: "GET", path: `/api/v1/secrets/${id}` });
}
