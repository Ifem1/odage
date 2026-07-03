import { VisibilityTreatment } from "@/lib/types";

const explanations: Record<VisibilityTreatment, string> = {
  foreground:
    "This layer became the primary visible interpretation while earlier meanings remain accessible beneath it.",
  side_by_side:
    "This layer is displayed side by side because consensus judged it a credible perspective that should not erase the earlier framing.",
  underlayer_visible:
    "This layer appears as a translucent overlay, with the older reading still visible underneath.",
  contested_overlay:
    "This layer is shown with tension markers because its framing is actively disputed by other layers.",
  archival_only:
    "This layer is preserved in the archive but is not shown in the default public reading.",
  sensitive_reveal:
    "This layer is held behind a content warning out of care for its subject matter.",
  human_review_required:
    "Consensus could not settle on a placement. This layer is pending human review.",
};

const labels: Record<VisibilityTreatment, string> = {
  foreground: "Foreground",
  side_by_side: "Side by Side",
  underlayer_visible: "Underlayer Visible",
  contested_overlay: "Contested Overlay",
  archival_only: "Archival Only",
  sensitive_reveal: "Sensitive Reveal",
  human_review_required: "Human Review Required",
};

export default function VisibilityTreatmentCard({
  treatment,
}: {
  treatment: VisibilityTreatment;
}) {
  return (
    <div className="rounded-sm border border-old-parchment bg-archive-bone/60 p-4">
      <p className="font-mono-detail text-[11px] uppercase tracking-widest text-faded-umber">
        Visibility treatment · {labels[treatment]}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-shadow-brown/90">{explanations[treatment]}</p>
    </div>
  );
}
