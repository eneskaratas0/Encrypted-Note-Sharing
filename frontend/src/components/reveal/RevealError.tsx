import { ErrorState, type ErrorStateReason } from "@/components/common/ErrorState";

export function RevealError({ reason }: { reason: ErrorStateReason }) {
  return <ErrorState reason={reason} />;
}
