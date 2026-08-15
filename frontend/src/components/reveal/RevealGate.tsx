import { Eye, Loader2, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface RevealGateProps {
  onReveal: () => void;
  pending: boolean;
}

/**
 * Deliberately requires an explicit click before any network call — this
 * is the mechanism that keeps the one-time view safe from StrictMode
 * double-invokes, route re-renders, and bfcache restores.
 */
export function RevealGate({ onReveal, pending }: RevealGateProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bu size gönderilen gizli bir not</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <ShieldAlert />
          <AlertTitle>Yalnızca bir kez görüntüleyebilirsiniz</AlertTitle>
          <AlertDescription>
            Notu açtığınızda sunucudan kalıcı olarak silinir. Devam etmeden önce not içeriğini
            kaydetmek isteyip istemediğinizi düşünün.
          </AlertDescription>
        </Alert>
        <Button type="button" onClick={onReveal} disabled={pending} className="w-full gap-1.5">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Eye className="size-4" />}
          Notu göster
        </Button>
      </CardContent>
    </Card>
  );
}
