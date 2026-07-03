"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { readGetAllRecords, readGetRecordLayers } from "@/lib/genlayer/client";
import { InterpretiveLayer, MemoryRecord, RecordCategory } from "@/lib/types";
import SensitivityBadge from "@/components/SensitivityBadge";

const allCategories: RecordCategory[] = [
  "Art",
  "History",
  "Community Conflict",
  "Memorial",
  "DAO Memory",
  "Education",
  "Reconciliation",
  "Contested",
  "Sensitive",
];

export default function ExplorePage() {
  const [active, setActive] = useState<RecordCategory | null>(null);
  const [records, setRecords] = useState<MemoryRecord[]>([]);
  const [layersByRecord, setLayersByRecord] = useState<Record<string, InterpretiveLayer[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const all = await readGetAllRecords();
      if (cancelled) return;
      setRecords(all);
      const entries = await Promise.all(
        all.map(async (r) => [r.record_id, await readGetRecordLayers(r.record_id)] as const),
      );
      if (cancelled) return;
      setLayersByRecord(Object.fromEntries(entries));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () =>
      active === null
        ? records
        : records.filter((r) => (r.categories ?? []).includes(active)),
    [active, records],
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="font-mono-detail text-xs uppercase tracking-[0.3em] text-faded-umber">Archive</p>
      <h1 className="mt-2 font-display text-3xl text-ink-charcoal">Explore memory records</h1>
      <p className="mt-3 max-w-xl text-sm text-shadow-brown/80">
        Each record holds layers of interpretation. Browse by category to find where memory is
        contested, mourned, expanded, or reframed.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <button
          onClick={() => setActive(null)}
          className={`font-mono-detail rounded-full border px-3 py-1 text-[11px] uppercase tracking-wide transition ${
            active === null
              ? "border-ink-charcoal bg-ink-charcoal text-soft-linen"
              : "border-dust-grey/60 text-shadow-brown/70 hover:border-ink-charcoal"
          }`}
        >
          All
        </button>
        {allCategories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`font-mono-detail rounded-full border px-3 py-1 text-[11px] uppercase tracking-wide transition ${
              active === c
                ? "border-ink-charcoal bg-ink-charcoal text-soft-linen"
                : "border-dust-grey/60 text-shadow-brown/70 hover:border-ink-charcoal"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-16 text-center text-sm italic text-dust-grey">Reading the archive…</p>
      ) : filtered.length === 0 ? (
        <p className="mt-16 text-center text-sm italic text-dust-grey">
          No memory records yet. Begin with an event, object, or story that deserves more than one
          interpretation.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => {
            const layers = layersByRecord[r.record_id] ?? [];
            const lastLayer = layers[layers.length - 1];
            return (
              <Link
                key={r.record_id}
                href={`/record/${r.record_id}`}
                className="group flex flex-col rounded-sm border border-old-parchment bg-archive-bone/50 p-6 transition hover:border-faded-umber hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-mono-detail text-[11px] uppercase tracking-widest text-faded-umber">
                    {r.event_timeframe}
                  </p>
                  <SensitivityBadge level={r.sensitivity_level} />
                </div>
                <h3 className="mt-2 font-display text-xl text-ink-charcoal group-hover:text-oxide-red">
                  {r.title}
                </h3>
                <p className="mt-1 text-xs text-dust-grey">{r.place_or_context}</p>
                <p className="mt-3 line-clamp-2 text-sm text-shadow-brown/80">
                  {r.base_event_summary}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(r.categories ?? []).map((c) => (
                    <span
                      key={c}
                      className="font-mono-detail rounded-full bg-old-parchment/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-shadow-brown/70"
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-old-parchment pt-3 text-xs text-dust-grey">
                  <span>{layers.length} layer{layers.length === 1 ? "" : "s"}</span>
                  {lastLayer && <span>last: {lastLayer.perspective_label}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
