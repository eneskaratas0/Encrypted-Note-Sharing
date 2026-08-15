import { ErrorState } from "@/components/common/ErrorState";

export function MissingKeyError() {
  return <ErrorState reason="missing-key" />;
}
