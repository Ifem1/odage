import { readFileSync } from "node:fs";
import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const privateKey = readFileSync(".env.local", "utf8").match(
  /^GENLAYER_PRIVATE_KEY=(0x[0-9a-fA-F]{64})$/m,
)?.[1];
if (!privateKey) throw new Error("GENLAYER_PRIVATE_KEY is missing from .env.local");

const client = createClient({ chain: studionet, account: createAccount(privateKey) });
const hash = await client.deployContract({
  code: readFileSync("contract/odage_contract.py", "utf8"),
  args: [],
});
console.log(`Deployment transaction: ${hash}`);

const receipt = await client.waitForTransactionReceipt({
  hash,
  status: TransactionStatus.FINALIZED,
  interval: 5_000,
  retries: 120,
});
if (receipt.txExecutionResultName && receipt.txExecutionResultName !== "SUCCESS") {
  throw new Error(`Deployment execution failed: ${JSON.stringify(receipt)}`);
}

const address = receipt.to_address ?? receipt.recipient;
if (!address) throw new Error(`Deployment returned no contract address: ${JSON.stringify(receipt)}`);
console.log(`CONTRACT_ADDRESS=${address}`);
