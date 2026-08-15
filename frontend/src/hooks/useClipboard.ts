import { useCallback, useRef, useState } from "react";

type CopyStatus = "idle" | "copied" | "error";

/**
 * Three-tier clipboard fallback:
 *  1. navigator.clipboard.writeText (secure context)
 *  2. hidden-textarea + document.execCommand('copy') (older/non-secure context)
 *  3. a readOnly input that auto-selects on focus, for the user to Ctrl+C manually
 */
export function useClipboard() {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const manualInputRef = useRef<HTMLInputElement | null>(null);

  const copy = useCallback(async (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        setStatus("copied");
        return true;
      } catch {
        // fall through to the next tier
      }
    }

    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const succeeded = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (succeeded) {
        setStatus("copied");
        return true;
      }
    } catch {
      // fall through to manual tier
    }

    manualInputRef.current?.focus();
    manualInputRef.current?.select();
    setStatus("error");
    return false;
  }, []);

  const reset = useCallback(() => setStatus("idle"), []);

  return { copy, status, reset, manualInputRef };
}
