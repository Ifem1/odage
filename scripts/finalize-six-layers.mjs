import { readFileSync } from "node:fs";
import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => [line.slice(0, line.indexOf("=")), line.slice(line.indexOf("=") + 1)]),
);
const client = createClient({
  chain: studionet,
  account: createAccount(env.GENLAYER_PRIVATE_KEY),
});
const address = env.NEXT_PUBLIC_ODAGE_CONTRACT_ADDRESS;

const submissions = [
  ["REC-2", "Constitutional continuity and amendment", "The 1999 Constitution remains the foundation of the Fourth Republic, while later amendments show that the constitutional record continues to evolve.", "https://www.refworld.org/legal/legislation/natlegbod/1999/en/67418"],
  ["REC-3", "From OAU to African Union", "The African Union's launch preserved pan-African institutional continuity while expanding the earlier organisation's mandate and governance ambitions.", "https://au.int/en/overview"],
  ["REC-4", "Regional integration as an unfinished project", "ECOWAS should be remembered not only through its founding treaty but through the continuing challenge of translating regional commitments into shared civic outcomes.", "https://www.ecowas.int/about-ecowas/"],
  ["REC-5", "Independence beyond a single ceremony", "Nigeria's independence date marks a constitutional transfer of authority, while decolonisation also involved longer political, cultural, and economic processes.", "https://www.britannica.com/place/Nigeria/Independent-Nigeria"],
  ["REC-6", "Museums and contested stewardship", "The museum's role includes preserving Nigerian heritage while participating in continuing debates about provenance, restitution, access, and public interpretation.", "https://museum.ng/lagos/"],
  ["REC-7", "A living cultural landscape", "Sukur is not only an archaeological property; its terraces, ritual places, settlement patterns, and community practices form a continuing cultural landscape.", "https://whc.unesco.org/en/list/938/"],
];

function decodeResult(receipt) {
  const leaders = receipt.consensus_data?.leader_receipt ?? [];
  const readable = leaders[0]?.result?.payload?.readable;
  if (typeof readable !== "string") throw new Error("Finalized receipt has no readable return value");
  const stderr = leaders.map((entry) => entry.genvm_result?.stderr ?? "").join("");
  if (stderr.includes("Reading storage in nondet mode is not supported")) {
    throw new Error("Storage warning returned during consensus");
  }
  return JSON.parse(JSON.parse(readable));
}

for (let index = 0; index < submissions.length; index += 1) {
  const [recordId, title, text, source] = submissions[index];
  const hash = await client.writeContract({
    address,
    functionName: "submit_layer",
    args: [recordId, title, text, "Educational framing", "Add context", JSON.stringify([source]), "reframes", new Date().toISOString()],
    value: 0n,
  });
  console.log(`${index + 1}/6 QUEUED ${hash} ${recordId}`);
  const receipt = await client.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.FINALIZED,
    interval: 5_000,
    retries: 180,
  });
  const layer = decodeResult(receipt);
  if (!layer.layer_id || !layer.consensus?.relationship_category) {
    throw new Error(`Invalid layer result for ${recordId}`);
  }
  console.log(`${index + 1}/6 FINALIZED ${hash} ${layer.layer_id} ${JSON.stringify(layer.consensus)}`);
}

const summary = await client.readContract({ address, functionName: "get_contract_summary", args: [] });
console.log(`FINAL_SUMMARY=${summary}`);
