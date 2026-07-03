import Link from "next/link";
import { InterpretiveLayer, VisibilityTreatment } from "@/lib/types";
import { ConsensusBadge } from "./ConsensusBadge";
import SensitiveReveal from "./SensitiveReveal";

const opacityByTreatment: Record<VisibilityTreatment, string> = {
  foreground: "opacity-100",
  side_by_side: "opacity-95",
  underlayer_visible: "opacity-70",
  contested_overlay: "opacity-90 tension-lines",
  archival_only: "opacity-50",
  sensitive_reveal: "opacity-100",
  human_review_required: "opacity-60",
};

function LayerCard({ layer }: { layer: InterpretiveLayer }) {
  const treatment = layer.consensus?.visibility_treatment ?? "foreground";
  const content = (
    <Link
      href={`/layer/${layer.layer_id}`}
      className={`group block rounded-sm border p-5 shadow-sm backdrop-blur-[1px] transition hover:-translate-y-0.5 hover:shadow-md ${opacityByTreatment[treatment]} ${
        layer.is_base_layer
          ? "border-faded-umber/50 bg-old-parchment/50"
          : "border-old-parchment bg-archive-bone/70"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-mono-detail text-[10px] uppercase tracking-widest text-faded-umber">
            {layer.is_base_layer ? "Original surface" : layer.perspective_label}
          </p>
          <h3 className="font-display text-xl text-ink-charcoal group-hover:text-oxide-red">
            {layer.layer_title}
          </h3>
        </div>
        {layer.consensus && <ConsensusBadge category={layer.consensus.relationship_category} />}
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-shadow-brown/85">
        {layer.layer_text}
      </p>
      <p className="font-mono-detail mt-3 text-[11px] text-dust-grey">{layer.created_at_label}</p>
    </Link>
  );

  if (treatment === "sensitive_reveal") {
    return <SensitiveReveal>{content}</SensitiveReveal>;
  }
  return content;
}

export default function PalimpsestStack({ layers }: { layers: InterpretiveLayer[] }) {
  return (
    <div className="space-y-[-8px]">
      {layers.map((layer, i) => (
        <div key={layer.layer_id} style={{ marginLeft: `${Math.min(i * 6, 30)}px` }} className="relative">
          <LayerCard layer={layer} />
        </div>
      ))}
    </div>
  );
}
