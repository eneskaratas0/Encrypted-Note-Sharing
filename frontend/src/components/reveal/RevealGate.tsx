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
        <CardTitle>This is a secret note sent to you</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <ShieldAlert />
          <AlertTitle>You can only view this once</AlertTitle>
          <AlertDescription>
            The note is permanently deleted from the server as soon as you open it. Consider
            whether you want to save its contents before continuing.
          </AlertDescription>
        </Alert>
        <Button type="button" onClick={onReveal} disabled={pending} className="w-full gap-1.5">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Eye className="size-4" />}
          Show note
        </Button>
      </CardContent>
    </Card>
  );
}
