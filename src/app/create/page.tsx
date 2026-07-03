"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { writeCreateRecord } from "@/lib/genlayer/client";
import { useWallet } from "@/lib/useWallet";
import { SensitivityLevel, VisibilityMode } from "@/lib/types";

const TITLE_MAX = 80;
const SUMMARY_MAX = 1200;

type Stage = "drafting" | "sending" | "created";

export default function CreateRecordPage() {
  const router = useRouter();
  const { address, connecting, connect } = useWallet();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [context, setContext] = useState("");
  const [sources, setSources] = useState("");
  const [sensitivity, setSensitivity] = useState<SensitivityLevel>("low");
  const [visibility, setVisibility] = useState<VisibilityMode>("public");
  const [stage, setStage] = useState<Stage>("drafting");
  const [recordId, setRecordId] = useState<string | null>(null);

  const canSubmit = title.trim().length > 0 && summary.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    if (!address) {
      await connect();
      return;
    }
    setStage("sending");
    const result = await writeCreateRecord(address, {
      title,
      base_event_summary: summary,
      event_timeframe: timeframe,
      place_or_context: context,
      source_urls: sources
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 5),
      sensitivity_level: sensitivity,
      visibility_mode: visibility,
    });
    setRecordId(result.record_id);
    setStage("created");
  }

  if (stage === "created" && recordId) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="font-mono-detail text-xs uppercase tracking-widest text-verdigris">
          Record created
        </p>
        <h1 className="mt-4 font-display text-3xl text-ink-charcoal">
          The first inscription is made.
        </h1>
        <p className="mt-4 text-sm text-shadow-brown/80">
          Your base layer now exists as the original surface. Others can add interpretive layers
          above it without erasing this record.
        </p>
        <p className="font-mono-detail mt-6 text-xs text-dust-grey">
          Note: this demo record is not yet linked to a real record page — connect the GenLayer
          contract to view it live at <span className="text-ink-charcoal">/record/{recordId}</span>.
        </p>
        <button
          onClick={() => router.push("/explore")}
          className="mt-8 rounded-sm bg-ink-charcoal px-6 py-3 font-mono-detail text-xs uppercase tracking-wider text-soft-linen transition hover:bg-oxide-red"
        >
          Return to archive
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="font-mono-detail text-xs uppercase tracking-[0.3em] text-faded-umber">
        Original surface
      </p>
      <h1 className="mt-2 font-display text-3xl text-ink-charcoal">Where this memory begins</h1>
      <p className="mt-3 text-sm text-shadow-brown/80">
        Prepare the first visible layer of a new memory record. It will remain visible beneath
        every interpretation added later.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <Field label="Title" hint={`${title.length}/${TITLE_MAX}`}>
          <input
            value={title}
            maxLength={TITLE_MAX}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="The Removed Riverfront Statue"
            className="w-full rounded-sm border border-old-parchment bg-soft-linen px-3 py-2 text-sm focus:border-faded-umber focus:outline-none"
          />
        </Field>

        <Field label="Base event summary" hint={`${summary.length}/${SUMMARY_MAX}`}>
          <textarea
            value={summary}
            maxLength={SUMMARY_MAX}
            onChange={(e) => setSummary(e.target.value)}
            rows={5}
            placeholder="Describe the original event, object, or story as plainly as possible."
            className="w-full rounded-sm border border-old-parchment bg-soft-linen px-3 py-2 text-sm focus:border-faded-umber focus:outline-none"
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Timeframe">
            <input
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              placeholder="1931–2025"
              className="w-full rounded-sm border border-old-parchment bg-soft-linen px-3 py-2 text-sm focus:border-faded-umber focus:outline-none"
            />
          </Field>
          <Field label="Place or context">
            <input
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Riverfront civic square"
              className="w-full rounded-sm border border-old-parchment bg-soft-linen px-3 py-2 text-sm focus:border-faded-umber focus:outline-none"
            />
          </Field>
        </div>

        <Field label="Source URLs (one per line, up to 5)">
          <textarea
            value={sources}
            onChange={(e) => setSources(e.target.value)}
            rows={3}
            placeholder="https://example.org/source"
            className="w-full rounded-sm border border-old-parchment bg-soft-linen px-3 py-2 font-mono-detail text-xs focus:border-faded-umber focus:outline-none"
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Sensitivity level">
            <select
              value={sensitivity}
              onChange={(e) => setSensitivity(e.target.value as SensitivityLevel)}
              className="w-full rounded-sm border border-old-parchment bg-soft-linen px-3 py-2 text-sm focus:border-faded-umber focus:outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="severe">Severe</option>
            </select>
          </Field>
          <Field label="Visibility mode">
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as VisibilityMode)}
              className="w-full rounded-sm border border-old-parchment bg-soft-linen px-3 py-2 text-sm focus:border-faded-umber focus:outline-none"
            >
              <option value="public">Public</option>
              <option value="restricted">Restricted</option>
              <option value="community_only">Community only</option>
            </select>
          </Field>
        </div>

        <button
          type="submit"
          disabled={!canSubmit || stage === "sending" || connecting}
          className="w-full rounded-sm bg-ink-charcoal px-6 py-3 font-mono-detail text-xs uppercase tracking-wider text-soft-linen transition hover:bg-oxide-red disabled:cursor-not-allowed disabled:opacity-40"
        >
          {stage === "sending"
            ? "Sending to GenLayer…"
            : connecting
              ? "Connecting wallet…"
              : !address
                ? "Connect wallet to inscribe"
                : "Inscribe first layer"}
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
