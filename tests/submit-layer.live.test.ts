import assert from "node:assert/strict";
import test from "node:test";
import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

import { decodeSubmitLayerResult } from "../src/lib/genlayer/result-decoder.ts";

const contractAddress =
  process.env.GENLAYER_CONTRACT_ADDRESS ?? process.env.NEXT_PUBLIC_ODAGE_CONTRACT_ADDRESS;
const privateKey = process.env.GENLAYER_PRIVATE_KEY;
const recordId = process.env.GENLAYER_TEST_RECORD_ID;
const hasLiveConfig = Boolean(contractAddress && privateKey && recordId);

test("live submit_layer returns the layer result consumed by the app", { skip: !hasLiveConfig }, async () => {
  const account = createAccount(privateKey! as `0x${string}`);
  const client = createClient({ chain: studionet, account });
  const hash = await client.writeContract({
    address: contractAddress! as `0x${string}`,
    functionName: "submit_layer",
    args: [
      recordId!,
      `Integration layer ${Date.now()}`,
      "A repository integration test verifies the live write result.",
      "Educational framing",
      "Teach complexity",
      "[]",
      "reframes",
      new Date().toISOString(),
    ],
    value: 0n,
  });
  const receipt = await client.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.FINALIZED,
    interval: 5_000,
    retries: 120,
  });
  const result = decodeSubmitLayerResult(receipt);

  assert.match(result.layer_id, /^LAYER-/);
  assert.ok(result.consensus);
  assert.equal(typeof result.consensus.short_reason, "string");
  assert.equal(typeof result.consensus.relationship_category, "string");
});
