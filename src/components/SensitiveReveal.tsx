"use client";

import { useState } from "react";

export default function SensitiveReveal({ children }: { children: React.ReactNode }) {
  const [revealed, setRevealed] = useState(false);

  if (revealed) {
    return <div>{children}</div>;
  }

  return (
    <div className="rounded-sm border border-oxide-red/40 bg-oxide-red/5 p-6 text-center">
      <p className="font-mono-detail text-[11px] uppercase tracking-widest text-oxide-red">
        Sensitive content
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm text-shadow-brown/80">
        This layer carries emotional or historical weight that consensus flagged for careful
        viewing. It has not been hidden — only held behind this notice.
      </p>
      <button
        onClick={() => setRevealed(true)}
        className="mt-4 rounded-sm border border-oxide-red px-4 py-1.5 font-mono-detail text-xs uppercase tracking-wider text-oxide-red transition hover:bg-oxide-red hover:text-soft-linen"
      >
        View this layer
      </button>
    </div>
  );
}
