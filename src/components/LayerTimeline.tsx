import Link from "next/link";
import { InterpretiveLayer } from "@/lib/types";
import { ConsensusBadge } from "./ConsensusBadge";

export default function LayerTimeline({ layers }: { layers: InterpretiveLayer[] }) {
  return (
    <ol className="relative space-y-8 border-l border-old-parchment pl-8">
      {layers.map((layer, i) => (
        <li key={layer.layer_id} className="relative">
          <span className="absolute -left-[38px] top-1 flex h-4 w-4 items-center justify-center rounded-full border border-faded-umber bg-soft-linen font-mono-detail text-[9px] text-faded-umber">
            {i}
          </span>
          <Link
            href={`/layer/${layer.layer_id}`}
            className="group block rounded-sm border border-old-parchment bg-archive-bone/40 p-4 transition hover:border-faded-umber"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-display text-lg text-ink-charcoal group-hover:text-oxide-red">
                {layer.layer_title}
              </h4>
              <span className="font-mono-detail text-[11px] text-dust-grey">
                {layer.created_at_label}
              </span>
            </div>
            <p className="mt-1 text-xs uppercase tracking-wide text-faded-umber">
              {layer.perspective_label}
              {layer.author && <span className="text-dust-grey"> · {layer.author}</span>}
            </p>
            {layer.consensus && (
              <div className="mt-3">
                <ConsensusBadge category={layer.consensus.relationship_category} />
              </div>
            )}
          </Link>
        </li>
      ))}
    </ol>
  );
}
