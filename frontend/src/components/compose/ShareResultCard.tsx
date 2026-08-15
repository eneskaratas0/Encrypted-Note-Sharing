import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/common/CopyButton";
import { SecurityNotice } from "@/components/common/SecurityNotice";
import { formatExpiry, formatRelativeTime } from "@/lib/format";
import type { CreatedShare } from "@/components/compose/ComposeForm";

interface ShareResultCardProps {
  share: CreatedShare;
  onCopied: () => void;
  onCreateAnother: () => void;
}

export function ShareResultCard({ share, onCopied, onCreateAnother }: ShareResultCardProps) {
  const relativeExpiry = formatRelativeTime(share.expiresAt);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paylaşım linkiniz hazır</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          {/* Rendered as read-only text, never a clickable <a> — link
              scanners / prefetchers that auto-visit hrefs would otherwise
              silently burn the one-time view before a human opens it. */}
          <input
            readOnly
            value={share.shareUrl}
            onFocus={(event) => event.currentTarget.select()}
            className="w-full rounded-lg border border-input bg-muted/40 px-2.5 py-2 font-mono text-xs select-all"
            aria-label="Paylaşım linki"
          />
          <CopyButton value={share.shareUrl} label="Linki kopyala" onCopied={onCopied} className="w-full" />
        </div>

        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Bu linki yalnızca güvendiğiniz kişiyle paylaşın</AlertTitle>
          <AlertDescription>
            Not en fazla{" "}
            <Badge variant="secondary" className="align-middle">
              {share.maxViews} kez
            </Badge>{" "}
            görüntülenebilir ve {formatExpiry(share.expiresAt)}
            {relativeExpiry ? ` (${relativeExpiry})` : ""} tarihinde kalıcı olarak silinir. Linki
              önizleme oluşturabilen sohbet/e-posta uygulamalarında paylaşmaktan kaçının.
          </AlertDescription>
        </Alert>

        <SecurityNotice text="Şifreleme anahtarı yalnızca bu linkte bulunur; sunucuya hiçbir zaman gönderilmedi ve saklanmadı." />

        <Button type="button" variant="ghost" onClick={onCreateAnother} className="w-full">
          Yeni not oluştur
        </Button>
      </CardContent>
    </Card>
  );
}
