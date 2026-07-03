export type SensitivityLevel = "low" | "medium" | "high" | "severe";

export type VisibilityMode = "public" | "restricted" | "community_only";

export type RelationshipCategory =
  | "contextual_expansion"
  | "counter_memory"
  | "repair_layer"
  | "mourning_layer"
  | "artistic_reframing"
  | "educational_annotation"
  | "contested_claim"
  | "harm_marker"
  | "minority_perspective"
  | "mythic_or_symbolic_layer"
  | "insufficiently_supported"
  | "bad_faith_distortion"
  | "duplicate_layer"
  | "needs_human_review";

export type VisibilityTreatment =
  | "foreground"
  | "side_by_side"
  | "underlayer_visible"
  | "contested_overlay"
  | "archival_only"
  | "sensitive_reveal"
  | "human_review_required";

export type SupportLevel =
  | "strong"
  | "moderate"
  | "weak"
  | "symbolic"
  | "unsupported"
  | "unclear";

export interface ConsensusResult {
  relationship_category: RelationshipCategory;
  visibility_treatment: VisibilityTreatment;
  support_level: SupportLevel;
  sensitivity: SensitivityLevel;
  keeps_prior_layers_visible: boolean;
  requires_warning: boolean;
  short_reason: string;
}

export type RecordCategory =
  | "Art"
  | "History"
  | "Community Conflict"
  | "Memorial"
  | "DAO Memory"
  | "Education"
  | "Reconciliation"
  | "Contested"
  | "Sensitive";

export interface MemoryRecord {
  record_id: string;
  creator: string;
  title: string;
  base_event_summary: string;
  event_timeframe: string;
  place_or_context: string;
  source_urls: string[];
  sensitivity_level: SensitivityLevel;
  visibility_mode: VisibilityMode;
  created_at_label: string;
  status: "active" | "archived";
  base_layer_id: string;
  // Not part of on-chain contract state (see contract/odage_contract.py) — populated
  // only for local mock data used when NEXT_PUBLIC_ODAGE_CONTRACT_ADDRESS is unset.
  categories?: RecordCategory[];
}

export interface InterpretiveLayer {
  layer_id: string;
  record_id: string;
  author: string;
  layer_title: string;
  layer_text: string;
  perspective_label: string;
  intended_effect: string;
  supporting_sources: string[];
  relation_claimed_by_author: string;
  consensus: ConsensusResult | null;
  created_at_label: string;
  status: "pending" | "placed" | "flagged";
  responds_to_layer_id?: string;
  is_base_layer?: boolean;
}
