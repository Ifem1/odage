import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { createAccount, generatePrivateKey } from "genlayer-js";

const envPath = ".env.local";
const current = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
const existingKey = current.match(/^GENLAYER_PRIVATE_KEY=(0x[0-9a-fA-F]{64})$/m)?.[1];
const privateKey = existingKey ?? generatePrivateKey();
const account = createAccount(privateKey);

if (!existingKey) {
  appendFileSync(envPath, `\nGENLAYER_PRIVATE_KEY=${privateKey}\n`);
}

console.log(`Disposable test account: ${account.address}`);
console.log(`Private key stored only in ignored ${envPath}`);
