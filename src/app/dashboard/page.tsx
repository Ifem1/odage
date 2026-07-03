"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  readGetAllRecords,
  readGetRecordLayers,
  readGetUserLayers,
  readGetUserRecords,
} from "@/lib/genlayer/client";
import { InterpretiveLayer, MemoryRecord } from "@/lib/types";
import { useWallet } from "@/lib/useWallet";

export default function DashboardPage() {
  const { address, connecting, connect } = useWallet();

  const [userRecords, setUserRecords] = useState<MemoryRecord[]>([]);
  const [userLayers, setUserLayers] = useState<InterpretiveLayer[]>([]);
  const [archiveLayers, setArchiveLayers] = useState<InterpretiveLayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const allRecords = await readGetAllRecords();
      const perRecordLayers = await Promise.all(
        allRecords.map((r) => readGetRecordLayers(r.record_id)),
      );
      if (cancelled) return;
      setArchiveLayers(perRecordLayers.flat());
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!address) {
      setUserRecords([]);
      setUserLayers([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const [records, layers] = await Promise.all([
        readGetUserRecords(address),
        readGetUserLayers(address),
      ]);
      if (cancelled) return;
      setUserRecords(records);
      setUserLayers(layers);
    })();
    return () => {
      cancelled = true;
    };
  }, [address]);

  const pending = userLayers.filter((l) => l.status === "pending");
  const sensitive = archiveLayers.filter(
    (l) => l.consensus?.sensitivity === "high" || l.consensus?.sensitivity === "severe",
  );
  const contested = archiveLayers.filter(
    (l) =>
      l.consensus &&
      ["counter_memory", "contested_claim", "bad_faith_distortion"].includes(
        l.consensus.relationship_category,
      ),
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      {address ? (
        <p className="font-mono-detail text-xs uppercase tracking-[0.3em] text-faded-umber">
          {address}
        </p>
      ) : (
        <button
          onClick={connect}
          disabled={connecting}
          className="rounded-sm border border-ink-charcoal/80 px-4 py-2 font-mono-detail text-xs uppercase tracking-wider text-ink-charcoal transition hover:bg-ink-charcoal hover:text-soft-linen"
        >
          {connecting ? "Connecting…" : "Connect wallet to see your records"}
        </button>
      )}
      <h1 className="mt-2 font-display text-3xl text-ink-charcoal">Your dashboard</h1>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <Section
          title="Records created"
          empty={address ? "You haven't created any records yet." : "Connect your wallet to see your records."}
        >
          {userRecords.map((r) => (
            <Link
              key={r.record_id}
              href={`/record/${r.record_id}`}
              className="block rounded-sm border border-old-parchment bg-archive-bone/40 p-4 hover:border-faded-umber"
            >
              <p className="font-display text-ink-charcoal">{r.title}</p>
              <p className="text-xs text-dust-grey">{r.event_timeframe}</p>
            </Link>
          ))}
        </Section>

        <Section
          title="Layers submitted"
          empty={address ? "You haven't submitted any layers yet." : "Connect your wallet to see your layers."}
        >
          {userLayers.map((l) => (
            <Link
              key={l.layer_id}
              href={`/layer/${l.layer_id}`}
              className="block rounded-sm border border-old-parchment bg-archive-bone/40 p-4 hover:border-faded-umber"
            >
              <p className="font-display text-ink-charcoal">{l.layer_title}</p>
              <p className="text-xs text-dust-grey">{l.perspective_label}</p>
            </Link>
          ))}
        </Section>

        <Section title="Pending layers" empty="No layers awaiting consensus.">
          {pending.map((l) => (
            <div key={l.layer_id} className="rounded-sm border border-old-parchment bg-archive-bone/40 p-4">
              <p className="font-display text-ink-charcoal">{l.layer_title}</p>
            </div>
          ))}
        </Section>

        <Section
          title="Sensitive layers in the archive"
          empty={loading ? "Reading the archive…" : "No sensitive layers flagged."}
        >
          {sensitive.map((l) => (
            <Link
              key={l.layer_id}
              href={`/layer/${l.layer_id}`}
              className="block rounded-sm border border-oxide-red/30 bg-oxide-red/5 p-4 hover:border-oxide-red"
            >
              <p className="font-display text-ink-charcoal">{l.layer_title}</p>
              <p className="text-xs text-oxide-red">{l.consensus?.sensitivity} sensitivity</p>
            </Link>
          ))}
        </Section>
      </div>

      <div className="mt-6">
        <Section
          title="Contested layers in the archive"
          empty={loading ? "Reading the archive…" : "No contested layers right now."}
        >
          {contested.map((l) => (
            <Link
              key={l.layer_id}
              href={`/layer/${l.layer_id}`}
              className="block rounded-sm border border-old-parchment bg-archive-bone/40 p-4 hover:border-faded-umber tension-lines"
            >
              <p className="font-display text-ink-charcoal">{l.layer_title}</p>
            </Link>
          ))}
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: React.ReactNode[];
}) {
  return (
    <div>
      <h2 className="font-mono-detail mb-3 text-[11px] uppercase tracking-widest text-faded-umber">
        {title}
      </h2>
      <div className="space-y-3">
        {children.length === 0 ? (
          <p className="text-sm italic text-dust-grey">{empty}</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
