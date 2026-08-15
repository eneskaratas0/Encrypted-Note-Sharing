import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Footer } from "@/components/layout/Footer";
import { PageContainer } from "@/components/common/PageContainer";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-heading text-sm font-medium">
            <Lock className="size-4 text-primary" aria-hidden="true" />
            Encrypted Note
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1">
        <PageContainer>{children}</PageContainer>
      </main>
      <Footer />
    </div>
  );
}
