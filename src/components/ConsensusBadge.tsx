import { RelationshipCategory, SupportLevel } from "@/lib/types";

const categoryLabels: Record<RelationshipCategory, string> = {
  contextual_expansion: "Contextual Expansion",
  counter_memory: "Counter-Memory",
  repair_layer: "Repair Layer",
  mourning_layer: "Mourning Layer",
  artistic_reframing: "Artistic Reframing",
  educational_annotation: "Educational Annotation",
  contested_claim: "Contested Claim",
  harm_marker: "Harm Marker",
  minority_perspective: "Minority Perspective",
  mythic_or_symbolic_layer: "Mythic / Symbolic",
  insufficiently_supported: "Insufficiently Supported",
  bad_faith_distortion: "Bad-Faith Distortion",
  duplicate_layer: "Duplicate Layer",
  needs_human_review: "Human Review",
};

const categoryColors: Record<RelationshipCategory, string> = {
  contextual_expansion: "bg-verdigris/10 text-verdigris border-verdigris/40",
  counter_memory: "bg-oxide-red/10 text-oxide-red border-oxide-red/40",
  repair_layer: "bg-consensus-blue/10 text-consensus-blue border-consensus-blue/40",
  mourning_layer: "bg-shadow-brown/10 text-shadow-brown border-shadow-brown/40",
  artistic_reframing: "bg-faded-umber/10 text-faded-umber border-faded-umber/40",
  educational_annotation: "bg-verdigris/10 text-verdigris border-verdigris/40",
  contested_claim: "bg-oxide-red/10 text-oxide-red border-oxide-red/40",
  harm_marker: "bg-oxide-red/15 text-oxide-red border-oxide-red/50",
  minority_perspective: "bg-consensus-blue/10 text-consensus-blue border-consensus-blue/40",
  mythic_or_symbolic_layer: "bg-faded-umber/10 text-faded-umber border-faded-umber/40",
  insufficiently_supported: "bg-dust-grey/20 text-shadow-brown border-dust-grey/50",
  bad_faith_distortion: "bg-oxide-red/15 text-oxide-red border-oxide-red/50",
  duplicate_layer: "bg-dust-grey/20 text-shadow-brown border-dust-grey/50",
  needs_human_review: "bg-consensus-blue/10 text-consensus-blue border-consensus-blue/40",
};

const supportLabels: Record<SupportLevel, string> = {
  strong: "Strong support",
  moderate: "Moderate support",
  weak: "Weak support",
  symbolic: "Symbolic",
  unsupported: "Unsupported",
  unclear: "Unclear",
};

export function ConsensusBadge({ category }: { category: RelationshipCategory }) {
  return (
    <span
      className={`font-mono-detail inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] uppercase tracking-wide ${categoryColors[category]}`}
    >
      {categoryLabels[category]}
    </span>
  );
}

export function SupportBadge({ level }: { level: SupportLevel }) {
  return (
    <span className="font-mono-detail inline-flex items-center rounded-full border border-dust-grey/50 px-2.5 py-0.5 text-[11px] text-shadow-brown/70">
      {supportLabels[level]}
    </span>
  );
}

export { categoryLabels };
