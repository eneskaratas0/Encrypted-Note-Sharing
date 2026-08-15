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
    title: "Not bulunamadı",
    message:
      "Bu not artık mevcut değil. Daha önce görüntülenmiş, süresi dolmuş ya da bağlantı hatalı olabilir.",
  },
  "rate-limited": {
    icon: <Clock className="size-6" />,
    title: "Çok fazla istek",
    message: "Kısa sürede çok fazla istek gönderildi. Lütfen biraz bekleyip tekrar deneyin.",
  },
  "service-unavailable": {
    icon: <ServerCrash className="size-6" />,
    title: "Servis şu anda kullanılamıyor",
    message: "Sunucu geçici olarak yanıt veremiyor. Lütfen birazdan tekrar deneyin.",
  },
  network: {
    icon: <WifiOff className="size-6" />,
    title: "Bağlantı hatası",
    message: "Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.",
  },
  "missing-key": {
    icon: <AlertTriangle className="size-6" />,
    title: "Bağlantı eksik",
    message:
      "Bu bağlantıda şifre çözme anahtarı bulunamadı. Linkin tamamını kopyaladığınızdan emin olun.",
  },
  "decrypt-failed": {
    icon: <KeyRound className="size-6" />,
    title: "Not çözülemedi",
    message: "Bu not bu bağlantıyla çözülemedi. Link hatalı ya da eksik kopyalanmış olabilir.",
  },
  unknown: {
    icon: <AlertTriangle className="size-6" />,
    title: "Bir şeyler ters gitti",
    message: "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
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
