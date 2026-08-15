import { useMutation } from "@tanstack/react-query";
import { createSecret } from "@/lib/api/secrets";

/**
 * POST /api/v1/secrets/ is not safe to auto-retry (a retry would create a
 * duplicate secret server-side), so retries are disabled.
 */
export function useCreateSecret() {
  return useMutation({
    mutationFn: createSecret,
    retry: 0,
  });
}
