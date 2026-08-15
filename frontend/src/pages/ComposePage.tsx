import { useState } from "react";
import { ComposeForm, type CreatedShare } from "@/components/compose/ComposeForm";
import { ShareResultCard } from "@/components/compose/ShareResultCard";
import { useBeforeUnloadWarning } from "@/hooks/useBeforeUnloadWarning";

export function ComposePage() {
  const [share, setShare] = useState<CreatedShare | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  useBeforeUnloadWarning(share !== null && !hasCopied);

  const handleCreateAnother = () => {
    setShare(null);
    setHasCopied(false);
  };

  return share ? (
    <ShareResultCard share={share} onCopied={() => setHasCopied(true)} onCreateAnother={handleCreateAnother} />
  ) : (
    <ComposeForm
      onCreated={(created) => {
        setShare(created);
        setHasCopied(false);
      }}
    />
  );
}
