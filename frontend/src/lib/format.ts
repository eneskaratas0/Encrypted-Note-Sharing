const HAS_TIMEZONE = /(Z|[+-]\d{2}:?\d{2})$/;

/**
 * The backend can return naive ISO datetime strings (no trailing 'Z' or
 * UTC offset) — SQLite doesn't preserve tzinfo, so a UTC-aware Python
 * datetime round-trips as naive and FastAPI serializes it without a zone
 * marker. `new Date(...)` parses a marker-less string as *local* time,
 * which silently corrupts every expiry calculation. Treat any
 * timezone-less timestamp from the API as UTC.
 */
function parseApiDate(value: string): Date {
  return new Date(HAS_TIMEZONE.test(value) ? value : `${value}Z`);
}

export function formatExpiry(expiresAt: string | null): string {
  if (!expiresAt) return "Süresiz (görüntülenene kadar geçerli)";
  return parseApiDate(expiresAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatRelativeTime(expiresAt: string | null): string | null {
  if (!expiresAt) return null;
  const diffMs = parseApiDate(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return "süresi doldu";

  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 60) return `${minutes} dakika içinde`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} saat içinde`;

  const days = Math.round(hours / 24);
  return `${days} gün içinde`;
}
