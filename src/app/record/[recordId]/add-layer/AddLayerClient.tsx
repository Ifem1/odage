"use client";

import { useState } from "react";
import Link from "next/link";
import { MemoryRecord } from "@/lib/types";
import { writeSubmitLayer } from "@/lib/genlayer/client";
import { useWallet } from "@/lib/useWallet";
import { ConsensusBadge } from "@/components/ConsensusBadge";
import VisibilityTreatmentCard from "@/components/VisibilityTreatmentCard";

const TITLE_MAX = 100;
const TEXT_MAX = 1500;

const perspectiveOptions = [
  "Official record",
  "Survivor memory",
  "Descendant perspective",
  "Artistic reading",
  "Local community view",
  "Educational framing",
  "Counter-memory",
  "Reconciliation attempt",
  "Mythic/symbolic reading",
  "Archival correction",
];

const effectOptions = [
  "Add context",
  "Repair harm",
  "Contest old framing",
  "Preserve grief",
  "Teach complexity",
  "Reclaim meaning",
  "Mark propaganda",
  "Keep minority perspective visible",
];

const relationOptions = ["agrees", "contests", "repairs", "mourns", "reframes"];

type Stage = "drafting" | "pending" | "placed";

export default function AddLayerClient({ record }: { record: MemoryRecord }) {
  const { address, connecting, connect } = useWallet();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [perspective, setPerspective] = useState(perspectiveOptions[0]);
  const [effect, setEffect] = useState(effectOptions[0]);
  const [relation, setRelation] = useState(relationOptions[0]);
  const [sources, setSources] = useState("");
  const [stage, setStage] = useState<Stage>("drafting");
  const [result, setResult] = useState<Awaited<ReturnType<typeof writeSubmitLayer>> | null>(null);

  const canSubmit = title.trim().length > 0 && text.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    if (!address) {
      await connect();
      return;
    }
    setStage("pending");
    const res = await writeSubmitLayer(address, {
      record_id: record.record_id,
      layer_title: title,
      layer_text: text,
      perspective_label: perspective,
      intended_effect: effect,
      supporting_sources: sources.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 5),
      relation_claimed_by_author: relation,
    });
    setResult(res);
    setStage("placed");
  }

  if (stage === "placed" && result?.consensus) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="font-mono-detail text-xs uppercase tracking-widest text-verdigris">
          Layer placed
        </p>
        <h1 className="mt-4 font-display text-3xl text-ink-charcoal">
          The layer has been placed. Earlier meanings remain visible.
        </h1>
        <div className="mt-6 flex justify-center">
          <ConsensusBadge category={result.consensus.relationship_category} />
        </div>
        <div className="mt-6">
          <VisibilityTreatmentCard treatment={result.consensus.visibility_treatment} />
        </div>
        <p className="mt-6 text-sm italic text-shadow-brown/80">{result.consensus.short_reason}</p>
        <Link
          href={`/record/${record.record_id}`}
          className="mt-8 inline-block rounded-sm bg-ink-charcoal px-6 py-3 font-mono-detail text-xs uppercase tracking-wider text-soft-linen transition hover:bg-oxide-red"
        >
          View palimpsest
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="font-mono-detail text-xs uppercase tracking-[0.3em] text-faded-umber">
        Adding to: {record.title}
      </p>
      <h1 className="mt-2 font-display text-3xl text-ink-charcoal">Add a layer of meaning</h1>
      <p className="mt-3 text-sm text-shadow-brown/80">
        Your interpretation will not replace what came before. Validators will classify how it
        relates to the archive beneath it.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <Field label="Layer title" hint={`${title.length}/${TITLE_MAX}`}>
          <input
            value={title}
            maxLength={TITLE_MAX}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Memory of Domination"
            className="w-full rounded-sm border border-old-parchment bg-soft-linen px-3 py-2 text-sm focus:border-faded-umber focus:outline-none"
          />
        </Field>

        <Field label="Interpretation text" hint={`${text.length}/${TEXT_MAX}`}>
          <textarea
            value={text}
            maxLength={TEXT_MAX}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder="Write the new interpretation..."
            className="w-full rounded-sm border border-old-parchment bg-soft-linen px-3 py-2 text-sm focus:border-faded-umber focus:outline-none"
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Perspective label">
            <select
              value={perspective}
              onChange={(e) => setPerspective(e.target.value)}
              className="w-full rounded-sm border border-old-parchment bg-soft-linen px-3 py-2 text-sm focus:border-faded-umber focus:outline-none"
            >
              {perspectiveOptions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Intended effect">
            <select
              value={effect}
              onChange={(e) => setEffect(e.target.value)}
              className="w-full rounded-sm border border-old-parchment bg-soft-linen px-3 py-2 text-sm focus:border-faded-umber focus:outline-none"
            >
              {effectOptions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="How does this relate to earlier layers?">
          <select
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            className="w-full rounded-sm border border-old-parchment bg-soft-linen px-3 py-2 text-sm focus:border-faded-umber focus:outline-none"
          >
            {relationOptions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>

        <Field label="Supporting source URLs (one per line, up to 5)">
          <textarea
            value={sources}
            onChange={(e) => setSources(e.target.value)}
            rows={3}
            placeholder="https://example.org/source"
            className="w-full rounded-sm border border-old-parchment bg-soft-linen px-3 py-2 font-mono-detail text-xs focus:border-faded-umber focus:outline-none"
          />
        </Field>

        <button
          type="submit"
          disabled={!canSubmit || stage === "pending" || connecting}
          className="w-full rounded-sm bg-oxide-red px-6 py-3 font-mono-detail text-xs uppercase tracking-wider text-soft-linen transition hover:bg-ink-charcoal disabled:cursor-not-allowed disabled:opacity-40"
        >
          {stage === "pending"
            ? "Validators are reading the new layer against the archive beneath it…"
            : connecting
              ? "Connecting wallet…"
              : !address
                ? "Connect wallet to submit"
                : "Submit layer"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="font-mono-detail text-[11px] uppercase tracking-widest text-faded-umber">
          {label}
        </span>
        {hint && <span className="text-[10px] text-dust-grey">{hint}</span>}
      </div>
      {children}
    </label>
  );
}
