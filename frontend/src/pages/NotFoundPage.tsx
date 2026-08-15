import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Compass className="size-6" />
        </div>
        <div className="space-y-1">
          <h1 className="font-heading text-base font-medium">Sayfa bulunamadı</h1>
          <p className="text-sm text-muted-foreground">Aradığınız sayfa mevcut değil.</p>
        </div>
        <Button asChild variant="outline" className="mt-2">
          <Link to="/">Ana sayfaya dön</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
