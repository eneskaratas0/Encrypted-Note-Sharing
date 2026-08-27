import type { ReactNode } from "react";
import { AlertTriangle, Clock, Ghost, KeyRound, ServerCrash, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type ErrorStateReason =
  | "not-found"
  | "rate-limited"
  | "service-unavailable"
  | "network"
  | "missing-key"
  | "decrypt-failed"
  | "unknown";

const REASON_CONTENT: Record<ErrorStateReason, { icon: ReactNode; title: string; message: string }> = {
  "not-found": {
    icon: <Ghost className="size-6" />,
    title: "Note not found",
    message:
      "This note no longer exists. It may have already been viewed, expired, or the link may be incorrect.",
  },
  "rate-limited": {
    icon: <Clock className="size-6" />,
    title: "Too many requests",
    message: "Too many requests were sent in a short time. Please wait a moment and try again.",
  },
  "service-unavailable": {
    icon: <ServerCrash className="size-6" />,
    title: "Service currently unavailable",
    message: "The server is temporarily unable to respond. Please try again shortly.",
  },
  network: {
    icon: <WifiOff className="size-6" />,
    title: "Connection error",
    message: "Could not reach the server. Check your internet connection and try again.",
  },
  "missing-key": {
    icon: <AlertTriangle className="size-6" />,
    title: "Incomplete link",
    message:
      "No decryption key was found in this link. Make sure you copied the entire link.",
  },
  "decrypt-failed": {
    icon: <KeyRound className="size-6" />,
    title: "Note could not be decrypted",
    message: "This note could not be decrypted with this link. The link may be incorrect or partially copied.",
  },
  unknown: {
    icon: <AlertTriangle className="size-6" />,
    title: "Something went wrong",
    message: "An unexpected error occurred. Please try again.",
  },
};

interface ErrorStateProps {
  reason: ErrorStateReason;
  actionLabel?: string;
  onAction?: () => void;
}

export function ErrorState({ reason, actionLabel, onAction }: ErrorStateProps) {
  const content = REASON_CONTENT[reason];

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {content.icon}
        </div>
        <div className="space-y-1">
          <h2 className="font-heading text-base font-medium">{content.title}</h2>
          <p className="text-sm text-muted-foreground">{content.message}</p>
        </div>
        {actionLabel && onAction ? (
          <Button variant="outline" onClick={onAction} className="mt-2">
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
