import { cn } from "@/lib/utils";
import { estimateEncryptedPayloadLength } from "@/lib/crypto";
import { MAX_PAYLOAD_LENGTH } from "@/lib/constants";

export function CharBudgetMeter({ note }: { note: string }) {
  const byteLength = new TextEncoder().encode(note).length;
  const estimated = estimateEncryptedPayloadLength(byteLength);
  const ratio = estimated / MAX_PAYLOAD_LENGTH;
  const isNearLimit = ratio > 0.9;

  return (
    <p
      className={cn(
        "text-right text-xs text-muted-foreground",
        isNearLimit && "text-destructive",
      )}
    >
      {estimated.toLocaleString()} / {MAX_PAYLOAD_LENGTH.toLocaleString()} bayt (şifreli, tahmini)
    </p>
  );
}
