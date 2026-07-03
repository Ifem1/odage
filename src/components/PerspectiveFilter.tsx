"use client";

export default function PerspectiveFilter({
  perspectives,
  active,
  onChange,
}: {
  perspectives: string[];
  active: string | null;
  onChange: (value: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`font-mono-detail rounded-full border px-3 py-1 text-[11px] uppercase tracking-wide transition ${
          active === null
            ? "border-ink-charcoal bg-ink-charcoal text-soft-linen"
            : "border-dust-grey/60 text-shadow-brown/70 hover:border-ink-charcoal"
        }`}
      >
        All perspectives
      </button>
      {perspectives.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`font-mono-detail rounded-full border px-3 py-1 text-[11px] uppercase tracking-wide transition ${
            active === p
              ? "border-ink-charcoal bg-ink-charcoal text-soft-linen"
              : "border-dust-grey/60 text-shadow-brown/70 hover:border-ink-charcoal"
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
