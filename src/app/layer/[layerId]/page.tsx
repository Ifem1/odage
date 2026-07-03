import { notFound } from "next/navigation";
import Link from "next/link";
import { readGetLayer, readGetRecord, readGetRecordLayers } from "@/lib/genlayer/client";
import { ConsensusBadge, SupportBadge } from "@/components/ConsensusBadge";
import SensitivityBadge from "@/components/SensitivityBadge";
import SourceTrail from "@/components/SourceTrail";
import VisibilityTreatmentCard from "@/components/VisibilityTreatmentCard";
import SensitiveReveal from "@/components/SensitiveReveal";

export default async function LayerDetailPage({
  params,
}: {
  params: Promise<{ layerId: string }>;
}) {
  const { layerId } = await params;
  const layer = await readGetLayer(layerId);
  if (!layer) notFound();
  const record = await readGetRecord(layer.record_id);
  if (!record) notFound();

  const siblingLayers = await readGetRecordLayers(layer.record_id);
  const idx = siblingLayers.findIndex((l) => l.layer_id === layerId);
  const prev = idx > 0 ? siblingLayers[idx - 1] : null;
  const next = idx < siblingLayers.length - 1 ? siblingLayers[idx + 1] : null;

  const body = (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={`/record/${record.record_id}`}
            className="font-mono-detail text-xs uppercase tracking-widest text-consensus-blue hover:text-oxide-red"
          >
            ← {record.title}
          </Link>
          <h1 className="mt-2 font-display text-3xl text-ink-charcoal">{layer.layer_title}</h1>
          <p className="mt-1 text-xs uppercase tracking-wide text-faded-umber">
            {layer.perspective_label} · {layer.author} · {layer.created_at_label}
          </p>
        </div>
        {layer.consensus && <SensitivityBadge level={layer.consensus.sensitivity} />}
      </div>

      <p className="mt-6 max-w-2xl leading-relaxed text-shadow-brown/90">{layer.layer_text}</p>

      {layer.consensus && (
        <div className="mt-8 space-y-4">
          <div className="flex flex-wrap gap-2">
            <ConsensusBadge category={layer.consensus.relationship_category} />
            <SupportBadge level={layer.consensus.support_level} />
          </div>
          <VisibilityTreatmentCard treatment={layer.consensus.visibility_treatment} />
          <p className="text-sm italic text-shadow-brown/80">{layer.consensus.short_reason}</p>
        </div>
      )}

      <div className="mt-8">
        <SourceTrail sources={layer.supporting_sources} />
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-old-parchment pt-6 text-sm">
        {prev ? (
          <Link href={`/layer/${prev.layer_id}`} className="text-consensus-blue hover:text-oxide-red">
            ← {prev.layer_title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/layer/${next.layer_id}`} className="text-consensus-blue hover:text-oxide-red">
            {next.layer_title} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </>
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      {layer.consensus?.visibility_treatment === "sensitive_reveal" ? (
        <SensitiveReveal>{body}</SensitiveReveal>
      ) : (
        body
      )}
    </div>
  );
}
