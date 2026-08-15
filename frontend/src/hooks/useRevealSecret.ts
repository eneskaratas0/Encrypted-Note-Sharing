import { useMutation } from "@tanstack/react-query";
import { revealSecret } from "@/lib/api/secrets";

/**
 * GET /api/v1/secrets/:id consumes one view and is destructive — modeled
 * as a mutation (not useQuery) so it is never cached, refetched on window
 * focus, or revalidated automatically. It must only ever be triggered by
 * calling `.mutate()`/`.mutateAsync()` from an explicit button click —
 * never from a mount effect or a router loader — so a StrictMode
 * double-invoke, a re-render, or a bfcache restore can never silently
 * burn the one-time view.
 */
export function useRevealSecret() {
  return useMutation({
    mutationFn: revealSecret,
    retry: 0,
  });
}
