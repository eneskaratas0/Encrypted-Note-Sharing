export type ApiErrorReason = "not-found" | "rate-limited" | "service-unavailable" | "validation" | "network" | "unknown";

export class ApiError extends Error {
  readonly reason: ApiErrorReason;
  readonly status: number | null;

  constructor(reason: ApiErrorReason, status: number | null, message: string) {
    super(message);
    this.name = "ApiError";
    this.reason = reason;
    this.status = status;
  }
}

export function mapStatusToReason(status: number): ApiErrorReason {
  switch (status) {
    case 404:
      return "not-found";
    case 429:
      return "rate-limited";
    case 503:
      return "service-unavailable";
    case 422:
    case 400:
      return "validation";
    default:
      return "unknown";
  }
}
