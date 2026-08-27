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
        <CardTitle>Your share link is ready</CardTitle>
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
            aria-label="Share link"
          />
          <CopyButton value={share.shareUrl} label="Copy link" onCopied={onCopied} className="w-full" />
        </div>

        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Only share this link with someone you trust</AlertTitle>
          <AlertDescription>
            The note can be viewed at most{" "}
            <Badge variant="secondary" className="align-middle">
              {share.maxViews} time{share.maxViews > 1 ? "s" : ""}
            </Badge>{" "}
            and will be permanently deleted on {formatExpiry(share.expiresAt)}
            {relativeExpiry ? ` (${relativeExpiry})` : ""}. Avoid sharing the link in
              chat/email apps that generate link previews.
          </AlertDescription>
        </Alert>

        <SecurityNotice text="The encryption key exists only in this link; it was never sent to or stored on the server." />

        <Button type="button" variant="ghost" onClick={onCreateAnother} className="w-full">
          Create new note
        </Button>
      </CardContent>
    </Card>
  );
}
