import { useEffect } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useClipboard } from "@/hooks/useClipboard";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  label?: string;
  onCopied?: () => void;
  className?: string;
}

export function CopyButton({ value, label = "Copy", onCopied, className }: CopyButtonProps) {
  const { copy, status, reset } = useClipboard();

  useEffect(() => {
    if (status === "copied") {
      onCopied?.();
      const timer = window.setTimeout(reset, 2000);
      return () => window.clearTimeout(timer);
    }
    if (status === "error") {
      // All copy tiers failed (clipboard API + execCommand) — do not fail
      // silently, since the user may otherwise navigate away thinking the
      // secret link/note was copied.
      toast.error("Couldn't copy. Please select and copy the text manually.");
      const timer = window.setTimeout(reset, 2000);
      return () => window.clearTimeout(timer);
    }
  }, [status, onCopied, reset]);

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={() => void copy(value)}
      className={cn("gap-1.5", className)}
      aria-label={status === "copied" ? "Copied" : label}
    >
      {status === "copied" ? <Check className="size-4" /> : <Copy className="size-4" />}
      {status === "copied" ? "Copied" : label}
    </Button>
  );
}
