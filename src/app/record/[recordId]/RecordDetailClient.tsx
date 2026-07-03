"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MemoryRecord, InterpretiveLayer } from "@/lib/types";
import PalimpsestStack from "@/components/PalimpsestStack";
import LayerTimeline from "@/components/LayerTimeline";
import PerspectiveFilter from "@/components/PerspectiveFilter";
import { ConsensusBadge } from "@/components/ConsensusBadge";
import SensitivityBadge from "@/components/SensitivityBadge";
import SourceTrail from "@/components/SourceTrail";

type ViewMode = "stack" | "timeline" | "conflict" | "reading";

const contestedCategories = new Set([
  "counter_memory",
  "contested_claim",
  "harm_marker",
  "bad_faith_distortion",
  "needs_human_review",
]);

export default function RecordDetailClient({
  record,
  layers,
}: {
  record: MemoryRecord;
  layers: InterpretiveLayer[];
}) {
  const [view, setView] = useState<ViewMode>("stack");
  const [perspective, setPerspective] = useState<string | null>(null);

  const perspectives = useMemo(
    () => Array.from(new Set(layers.map((l) => l.perspective_label))),
    [layers],
  );

  const visibleLayers = useMemo(
    () => (perspective ? layers.filter((l) => l.perspective_label === perspective) : layers),
    [layers, perspective],
  );

  const agreeing = visibleLayers.filter(
    (l) => l.consensus && !contestedCategories.has(l.consensus.relationship_category) && !l.is_base_layer,
  );
  const contested = visibleLayers.filter(
    (l) => l.consensus && contestedCategories.has(l.consensus.relationship_category),
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono-detail text-xs uppercase tracking-[0.3em] text-faded-umber">
            {record.event_timeframe} · {record.place_or_context}
          </p>
          <h1 className="mt-2 font-display text-3xl text-ink-charcoal">{record.title}</h1>
        </div>
        <SensitivityBadge level={record.sensitivity_level} />
      </div>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-shadow-brown/85">
        {record.base_event_summary}
      </p>

      <div className="mt-6">
        <SourceTrail sources={record.source_urls} />
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-y border-old-parchment py-4">
        <div className="flex gap-1 rounded-sm border border-old-parchment bg-archive-bone/50 p-1">
          {(
            [
              ["stack", "Stack"],
              ["timeline", "Timeline"],
              ["conflict", "Conflict"],
              ["reading", "Reading"],
            ] as [ViewMode, string][]
          ).map(([mode, label]) => (
            <button
              key={mode}
              onClick={() => setView(mode)}
              className={`font-mono-detail rounded-sm px-3 py-1.5 text-[11px] uppercase tracking-wide transition ${
                view === mode
                  ? "bg-ink-charcoal text-soft-linen"
                  : "text-shadow-brown/70 hover:bg-old-parchment/50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <Link
          href={`/record/${record.record_id}/add-layer`}
          className="rounded-sm bg-oxide-red px-4 py-2 font-mono-detail text-xs uppercase tracking-wider text-soft-linen transition hover:bg-ink-charcoal"
        >
          Add a layer of meaning
        </Link>
      </div>

      <div className="mt-6">
        <PerspectiveFilter perspectives={perspectives} active={perspective} onChange={setPerspective} />
      </div>

      <div className="mt-8">
        {view === "stack" && (
          visibleLayers.length <= 1 ? (
            <p className="text-sm italic text-dust-grey">
              This record has only its first visible layer. Add another interpretation without
              erasing the original.
            </p>
          ) : (
            <PalimpsestStack layers={visibleLayers} />
          )
        )}

        {view === "timeline" && <LayerTimeline layers={visibleLayers} />}

        {view === "conflict" && (
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="font-mono-detail mb-3 text-[11px] uppercase tracking-widest text-verdigris">
                Agreement / expansion
              </p>
              <div className="space-y-3">
                {agreeing.length === 0 && (
                  <p className="text-sm italic text-dust-grey">No agreeing layers yet.</p>
                )}
                {agreeing.map((l) => (
                  <Link
                    key={l.layer_id}
                    href={`/layer/${l.layer_id}`}
                    className="block rounded-sm border border-verdigris/40 bg-verdigris/5 p-4 hover:border-verdigris"
                  >
                    <p className="font-display text-ink-charcoal">{l.layer_title}</p>
                    {l.consensus && <ConsensusBadge category={l.consensus.relationship_category} />}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="font-mono-detail mb-3 text-[11px] uppercase tracking-widest text-oxide-red">
                Contest / repair / mourning
              </p>
              <div className="space-y-3">
                {contested.length === 0 && (
                  <p className="text-sm italic text-dust-grey">No contested layers yet.</p>
                )}
                {contested.map((l) => (
                  <Link
                    key={l.layer_id}
                    href={`/layer/${l.layer_id}`}
                    className="block rounded-sm border border-oxide-red/40 bg-oxide-red/5 p-4 hover:border-oxide-red tension-lines"
                  >
                    <p className="font-display text-ink-charcoal">{l.layer_title}</p>
                    {l.consensus && <ConsensusBadge category={l.consensus.relationship_category} />}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === "reading" && (
          <div className="prose-none space-y-8">
            {visibleLayers.map((l) => (
              <div key={l.layer_id} className="border-l-2 border-old-parchment pl-6">
                <p className="font-mono-detail text-[11px] uppercase tracking-widest text-faded-umber">
                  {l.is_base_layer ? "Original surface" : l.perspective_label} · {l.created_at_label}
                </p>
                <h3 className="mt-1 font-display text-xl text-ink-charcoal">{l.layer_title}</h3>
                <p className="mt-2 leading-relaxed text-shadow-brown/90">{l.layer_text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
