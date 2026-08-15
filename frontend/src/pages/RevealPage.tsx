import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { RevealGate } from "@/components/reveal/RevealGate";
import { RevealedNote } from "@/components/reveal/RevealedNote";
import { RevealError } from "@/components/reveal/RevealError";
import { MissingKeyError } from "@/components/reveal/MissingKeyError";
import type { ErrorStateReason } from "@/components/common/ErrorState";
import { useRevealSecret } from "@/hooks/useRevealSecret";
import { parseKeyFragment } from "@/lib/url";
import { decryptNote, importKeyFromFragment } from "@/lib/crypto";
import { ApiError } from "@/lib/api/errors";

type RevealState =
  | { status: "idle" }
  | { status: "revealed"; plaintext: string }
  | { status: "error"; reason: ErrorStateReason };

function errorReason(error: unknown): ErrorStateReason {
  if (error instanceof ApiError) {
    if (error.reason === "not-found" || error.reason === "rate-limited" || error.reason === "service-unavailable" || error.reason === "network") {
      return error.reason;
    }
  }
  return "unknown";
}

export function RevealPage() {
  const { id } = useParams<{ id: string }>();
  const keyFragment = parseKeyFragment(window.location.hash);
  const revealSecret = useRevealSecret();
  const [state, setState] = useState<RevealState>({ status: "idle" });
  // react-query's `isPending` only flips after `mutateAsync` is invoked and
  // a render has flushed, which leaves a window (spanning the `await
  // importKeyFromFragment` below) where a fast double-click/double-tap can
  // re-enter this handler and fire two GETs, burning a one-time view twice.
  // This ref is set synchronously on first entry to close that window.
  const isRevealingRef = useRef(false);

  if (!id || !keyFragment) {
    return <MissingKeyError />;
  }

  const handleReveal = async () => {
    if (isRevealingRef.current) return;
    isRevealingRef.current = true;
    try {
      const key = await importKeyFromFragment(keyFragment);
      const secret = await revealSecret.mutateAsync(id);
      const plaintext = await decryptNote(secret.encrypted_payload, key);
      setState({ status: "revealed", plaintext });
    } catch (error) {
      const reason = error instanceof ApiError ? errorReason(error) : "decrypt-failed";
      setState({ status: "error", reason });
    }
  };

  if (state.status === "revealed") {
    return <RevealedNote plaintext={state.plaintext} />;
  }

  if (state.status === "error") {
    return <RevealError reason={state.reason} />;
  }

  return <RevealGate onReveal={() => void handleReveal()} pending={revealSecret.isPending} />;
}
