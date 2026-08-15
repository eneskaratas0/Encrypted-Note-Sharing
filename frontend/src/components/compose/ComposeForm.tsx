import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CharBudgetMeter } from "@/components/compose/CharBudgetMeter";
import { useCreateSecret } from "@/hooks/useCreateSecret";
import { composeSchema, type ComposeFormValues } from "@/lib/validation/composeSchema";
import { DEFAULT_MAX_VIEWS, DEFAULT_TTL_SECONDS, MAX_VIEWS_PRESETS, TTL_PRESETS } from "@/lib/constants";
import { encryptNote, exportKeyToFragment, generateKey } from "@/lib/crypto";
import { buildShareUrl } from "@/lib/url";
import { ApiError } from "@/lib/api/errors";

export interface CreatedShare {
  shareUrl: string;
  expiresAt: string | null;
  maxViews: number;
}

function errorToastMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.reason === "rate-limited") return "Çok fazla istek gönderildi. Lütfen biraz bekleyip tekrar deneyin.";
    if (error.reason === "service-unavailable") return "Sunucu şu anda kullanılamıyor. Lütfen tekrar deneyin.";
    if (error.reason === "network") return "Sunucuya ulaşılamadı. Bağlantınızı kontrol edin.";
    return error.message;
  }
  return "Not oluşturulurken bir hata oluştu.";
}

export function ComposeForm({ onCreated }: { onCreated: (share: CreatedShare) => void }) {
  const createSecret = useCreateSecret();

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ComposeFormValues>({
    resolver: zodResolver(composeSchema),
    defaultValues: {
      note: "",
      ttlSeconds: DEFAULT_TTL_SECONDS,
      maxViews: DEFAULT_MAX_VIEWS,
    },
  });

  const note = watch("note");
  const busy = isSubmitting || createSecret.isPending;

  const onSubmit = async (values: ComposeFormValues) => {
    try {
      const key = await generateKey();
      const encryptedPayload = await encryptNote(values.note, key);

      const response = await createSecret.mutateAsync({
        encrypted_payload: encryptedPayload,
        ttl_seconds: values.ttlSeconds,
        max_views: values.maxViews,
      });

      const keyFragment = await exportKeyToFragment(key);
      const shareUrl = buildShareUrl(response.id, keyFragment);

      onCreated({ shareUrl, expiresAt: response.expires_at, maxViews: response.max_views });
      reset();
    } catch (error) {
      toast.error(errorToastMessage(error));
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="note">Notunuz</Label>
        <Textarea
          id="note"
          rows={8}
          placeholder="Paylaşmak istediğiniz gizli metni buraya yazın..."
          aria-invalid={Boolean(errors.note)}
          {...register("note")}
        />
        {errors.note ? (
          <p className="text-xs text-destructive" role="alert">
            {errors.note.message}
          </p>
        ) : (
          <CharBudgetMeter note={note} />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="ttl">Geçerlilik süresi</Label>
          <Controller
            control={control}
            name="ttlSeconds"
            render={({ field }) => (
              <Select value={String(field.value)} onValueChange={(value) => field.onChange(Number(value))}>
                <SelectTrigger id="ttl" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TTL_PRESETS.map((preset) => (
                    <SelectItem key={preset.seconds} value={String(preset.seconds)}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="max-views">Maksimum görüntüleme</Label>
          <Controller
            control={control}
            name="maxViews"
            render={({ field }) => (
              <Select value={String(field.value)} onValueChange={(value) => field.onChange(Number(value))}>
                <SelectTrigger id="max-views" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MAX_VIEWS_PRESETS.map((count) => (
                    <SelectItem key={count} value={String(count)}>
                      {count} kez
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <Button type="submit" disabled={busy} className="w-full gap-1.5">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Güvenli link oluştur
      </Button>
    </form>
  );
}
