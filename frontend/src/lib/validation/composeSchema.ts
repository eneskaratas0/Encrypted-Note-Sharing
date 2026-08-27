import { z } from "zod";
import { estimateEncryptedPayloadLength } from "@/lib/crypto";
import { MAX_PAYLOAD_LENGTH, MAX_TTL_SECONDS, MAX_VIEWS_LIMIT } from "@/lib/constants";

export const composeSchema = z.object({
  note: z
    .string()
    .min(1, "Note cannot be empty")
    .superRefine((value, ctx) => {
      // Must check UTF-8 byte length, not JS string length — multi-byte
      // characters would otherwise slip past a naive .length check.
      const byteLength = new TextEncoder().encode(value).length;
      const estimatedPayloadLength = estimateEncryptedPayloadLength(byteLength);
      if (estimatedPayloadLength > MAX_PAYLOAD_LENGTH) {
        ctx.addIssue({
          code: "custom",
          message: "The note exceeds the allowed size once encrypted",
        });
      }
    }),
  ttlSeconds: z.number().int().gt(0).lte(MAX_TTL_SECONDS),
  maxViews: z.number().int().gt(0).lte(MAX_VIEWS_LIMIT),
});

export type ComposeFormValues = z.infer<typeof composeSchema>;
