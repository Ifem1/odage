import { readFileSync } from "node:fs";
import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const separator = line.indexOf("=");
      return [line.slice(0, separator), line.slice(separator + 1)];
    }),
);

const privateKey = env.GENLAYER_PRIVATE_KEY;
const contractAddress = env.NEXT_PUBLIC_ODAGE_CONTRACT_ADDRESS;
if (!privateKey || !contractAddress) throw new Error("Missing live test configuration in .env.local");

const account = createAccount(privateKey);
const client = createClient({ chain: studionet, account });

function leaderResult(receipt) {
  const visit = (value) => {
    if (!value || typeof value !== "object") return undefined;
    const leader = value.leader_receipt ?? value.leaderReceipt;
    const leaderEntry = Array.isArray(leader) ? leader[0] : leader;
    const readable = leaderEntry?.result?.payload?.readable;
    if (typeof readable === "string") return JSON.parse(readable);
    if (leaderEntry?.result !== undefined) return leaderEntry.result;
    for (const child of Object.values(value)) {
      const found = visit(child);
      if (found !== undefined) return found;
    }
  };
  return visit(receipt);
}

async function finalizedWrite(functionName, args) {
  const hash = await client.writeContract({
    address: contractAddress,
    functionName,
    args,
    value: 0n,
  });
  console.log(`${functionName} transaction: ${hash}`);
  const receipt = await client.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.FINALIZED,
    interval: 5000,
    retries: 120,
  });
  const result = leaderResult(receipt);
  if (typeof result !== "string" || !result) {
    throw new Error(`${functionName} finalized without a return value: ${JSON.stringify(receipt)}`);
  }
  return result;
}

const summary = await client.readContract({
  address: contractAddress,
  functionName: "get_contract_summary",
  args: [],
});
console.log(`Contract summary before test: ${summary}`);

const now = new Date().toISOString();
const recordId =
  env.GENLAYER_TEST_RECORD_ID ??
  (await finalizedWrite("create_record", [
    "Nigeria Data Protection Act 2023 — Public Record",
    "Nigeria enacted the Nigeria Data Protection Act in June 2023, establishing a national framework for personal-data protection and the Nigeria Data Protection Commission.",
    "June 2023",
    "Federal Republic of Nigeria",
    JSON.stringify(["https://ndpc.gov.ng/Files/Nigeria_Data_Protection_Act_2023.pdf"]),
    "low",
    "public",
    now,
  ]));
console.log(`${env.GENLAYER_TEST_RECORD_ID ? "Using" : "Created"} record: ${recordId}`);

const layerRaw = env.GENLAYER_TEST_LAYER_ID
  ? await client.readContract({
      address: contractAddress,
      functionName: "get_layer",
      args: [env.GENLAYER_TEST_LAYER_ID],
    })
  : await finalizedWrite("submit_layer", [
      recordId,
      "Implementation context from the regulator",
      "The Act should be read alongside the regulator's current guidance and institutional role, because implementation practice adds context beyond the enacted text.",
      "Educational framing",
      "Add context",
      JSON.stringify(["https://ndpc.gov.ng/", "https://ndpc.gov.ng/Files/Nigeria_Data_Protection_Act_2023.pdf"]),
      "reframes",
      new Date().toISOString(),
    ]);
const layer = JSON.parse(layerRaw);
if (!layer.layer_id || !layer.consensus?.relationship_category || !layer.consensus?.support_level) {
  throw new Error(`Invalid submitted layer result: ${layerRaw}`);
}
console.log(`${env.GENLAYER_TEST_LAYER_ID ? "Using" : "Created"} layer: ${layer.layer_id}`);
console.log(`Consensus: ${JSON.stringify(layer.consensus)}`);

const storedRecordRaw = await client.readContract({
  address: contractAddress,
  functionName: "get_record",
  args: [recordId],
});
const storedLayerRaw = await client.readContract({
  address: contractAddress,
  functionName: "get_layer",
  args: [layer.layer_id],
});
const storedRecord = JSON.parse(storedRecordRaw);
const storedLayer = JSON.parse(storedLayerRaw);
if (storedRecord.record_id !== recordId || storedLayer.layer_id !== layer.layer_id) {
  throw new Error("Read-after-write verification failed");
}

console.log(`FLOW_OK record=${recordId} layer=${layer.layer_id}`);
