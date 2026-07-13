import assert from "node:assert/strict";
import test from "node:test";

import { decodeSubmitLayerResult } from "../src/lib/genlayer/result-decoder.ts";

test("decodes submit_layer from a GenLayer leader receipt", () => {
  const layer = {
    layer_id: "LAYER-2",
    consensus: {
      relationship_category: "contextual_expansion",
      visibility_treatment: "side_by_side",
      support_level: "moderate",
      sensitivity: "low",
      keeps_prior_layers_visible: true,
      requires_warning: false,
      short_reason: "The cited material adds relevant context.",
    },
  };
  const receipt = { data: { consensus_data: { leader_receipt: { result: JSON.stringify(layer) } } } };

  assert.deepEqual(decodeSubmitLayerResult(receipt), layer);
});

test("rejects a finalized write with no decodable return value", () => {
  assert.throws(
    () => decodeSubmitLayerResult({ data: { consensus_data: {} } }),
    /without a decodable layer result/,
  );
});
