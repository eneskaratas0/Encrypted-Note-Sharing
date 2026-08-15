import { ShieldCheck } from "lucide-react";

export function SecurityNotice({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 text-xs text-muted-foreground">
      <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden="true" />
      <p>{text}</p>
    </div>
  );
}
