/**
 * The decryption key lives only in the URL fragment (`#k=...`) so it is
 * never sent to the server in any HTTP request. `#k=` (query-param-style
 * inside the fragment) is used instead of a bare `#<key>` so the scheme
 * stays extensible (e.g. a future `#k=...&v=1`) without a breaking change.
 */
export function buildShareUrl(id: string, keyFragment: string): string {
  const url = new URL(`/s/${id}`, window.location.origin);
  url.hash = `k=${keyFragment}`;
  return url.toString();
}

/** Reads the `k` param out of a location hash. Returns null if absent/malformed. */
export function parseKeyFragment(hash: string): string | null {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!raw) return null;
  const params = new URLSearchParams(raw);
  const key = params.get("k");
  return key && key.length > 0 ? key : null;
}
