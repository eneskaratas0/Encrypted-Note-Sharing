import { useEffect } from "react";
import { useBlocker } from "react-router-dom";

/**
 * Warns before the user leaves a screen that holds a still-live secret
 * (e.g. a freshly created share link that hasn't been copied yet).
 * Covers both in-SPA navigation (React Router's useBlocker) and tab
 * close/refresh (beforeunload).
 */
const CONFIRM_MESSAGE =
  "Bu paylaşım linkini henüz kopyalamadınız. Sayfadan ayrılırsanız linke tekrar erişemeyebilirsiniz. Yine de ayrılmak istiyor musunuz?";

export function useBeforeUnloadWarning(shouldWarn: boolean) {
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    return shouldWarn && currentLocation.pathname !== nextLocation.pathname;
  });

  useEffect(() => {
    if (blocker.state !== "blocked") return;
    if (window.confirm(CONFIRM_MESSAGE)) {
      blocker.proceed();
    } else {
      blocker.reset();
    }
  }, [blocker]);

  useEffect(() => {
    if (!shouldWarn) return;

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [shouldWarn]);
}
