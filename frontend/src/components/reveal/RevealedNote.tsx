import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CopyButton } from "@/components/common/CopyButton";

export function RevealedNote({ plaintext }: { plaintext: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Not içeriği</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <pre className="max-h-96 overflow-auto rounded-lg border border-input bg-muted/40 p-3 text-sm whitespace-pre-wrap">
          {plaintext}
        </pre>
        <CopyButton value={plaintext} label="Not metnini kopyala" className="w-full" />
        <Alert>
          <CheckCircle2 />
          <AlertTitle>Bu not artık tekrar görüntülenemez</AlertTitle>
          <AlertDescription>Kalıcı olarak silindi. İçeriği kaydetmek istiyorsanız şimdi kopyalayın.</AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
