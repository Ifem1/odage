import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import type { Address } from "genlayer-js/types";
import { InterpretiveLayer, MemoryRecord } from "../types";
import {
  decodeSubmitLayerResult,
  extractWriteResult,
  parseJsonField,
  type SubmitLayerResult,
} from "./result-decoder";
import {
  getLayer,
  getRecord,
  getRecordLayers,
  mockLayers,
  mockRecords,
} from "../mock-data";

// Set NEXT_PUBLIC_ODAGE_CONTRACT_ADDRESS once the OdageContract (contract/odage_contract.py)
// is deployed to StudioNet. Until then the app runs entirely against local mock data that
// mirrors the on-chain record/layer shape, so every page works standalone.
export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_ODAGE_CONTRACT_ADDRESS ?? "") as Address | "";
const isLive = CONTRACT_ADDRESS.length > 0;

declare global {
  interface Window {
    genlayer?: unknown;
    ethereum?: unknown;
  }
}

function getInjectedProvider() {
  if (typeof window === "undefined") return undefined;
  return (window.genlayer ?? window.ethereum) as never;
}

// Read client talks directly to GenLayer RPC — no wallet needed. Cached once since
// reads never depend on which account is connected.
let cachedReadClient: ReturnType<typeof createClient> | null = null;
function getReadClient() {
  if (!cachedReadClient) {
    cachedReadClient = createClient({ chain: studionet });
  }
  return cachedReadClient;
}

// Write client must be signed by the connected wallet account, so it's built fresh
// per call from the address the caller passed in (from useWallet()), following the
// genlayer-js "wallet provider" pattern: account = connected address, provider = injected.
async function getWriteClient(walletAddress: string) {
  const provider = getInjectedProvider();
  if (!provider) {
    throw new Error("No injected wallet found. Connect a GenLayer-compatible wallet first.");
  }
  return createClient({
    chain: studionet,
    account: walletAddress as Address,
    provider,
  });
}

function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}


// The contract stores source URLs as a JSON-encoded string (`source_urls_json`) since
// GenVM state is flat JSON; the frontend works with a plain `source_urls` string array.
function normaliseRecord(raw: unknown): MemoryRecord | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const record = raw as Record<string, unknown> & Partial<MemoryRecord>;
  const source_urls = Array.isArray(record.source_urls)
    ? (record.source_urls as string[])
    : parseJsonField<string[]>(record.source_urls_json, []);
  return { ...record, source_urls } as MemoryRecord;
}

// ---- Reads ----

// StudioNet RPC calls can time out (network hiccups, node restarts, etc). Reads should
// degrade to an empty/undefined result rather than crashing the page they're used in.
async function safeReadContract(functionName: string, args: unknown[]): Promise<unknown> {
  try {
    return await getReadClient().readContract({
      address: CONTRACT_ADDRESS as Address,
      functionName,
      args: args as never[],
    });
  } catch (error) {
    console.error(`GenLayer read failed (${functionName}):`, error);
    return undefined;
  }
}

export async function readGetRecord(recordId: string): Promise<MemoryRecord | undefined> {
  if (!isLive) return delay(getRecord(recordId));
  const raw = await safeReadContract("get_record", [recordId]);
  return normaliseRecord(parseJsonField<Record<string, unknown> | undefined>(raw, undefined));
}

export async function readGetLayer(layerId: string): Promise<InterpretiveLayer | undefined> {
  if (!isLive) return delay(getLayer(layerId));
  const raw = await safeReadContract("get_layer", [layerId]);
  return parseJsonField<InterpretiveLayer | undefined>(raw, undefined);
}

export async function readGetRecordLayers(recordId: string): Promise<InterpretiveLayer[]> {
  if (!isLive) return delay(getRecordLayers(recordId));
  const idsRaw = await safeReadContract("get_record_layers", [recordId]);
  const ids = typeof idsRaw === "string" && idsRaw.length > 0 ? idsRaw.split("|") : [];
  const layers = await Promise.all(ids.map((id) => readGetLayer(id)));
  return layers.filter((l): l is InterpretiveLayer => Boolean(l));
}

export async function readGetAllRecords(): Promise<MemoryRecord[]> {
  if (!isLive) return delay(mockRecords);
  const idsRaw = await safeReadContract("get_record_index", []);
  const ids = typeof idsRaw === "string" && idsRaw.length > 0 ? idsRaw.split("|") : [];
  const records = await Promise.all(ids.map((id) => readGetRecord(id)));
  return records.filter((r): r is MemoryRecord => Boolean(r));
}

export async function readGetUserRecords(address: string): Promise<MemoryRecord[]> {
  if (!isLive) {
    return delay(mockRecords.filter((r) => r.creator.toLowerCase() === address.toLowerCase()));
  }
  const idsRaw = await safeReadContract("get_user_records", [address]);
  const ids = typeof idsRaw === "string" && idsRaw.length > 0 ? idsRaw.split("|") : [];
  const records = await Promise.all(ids.map((id) => readGetRecord(id)));
  return records.filter((r): r is MemoryRecord => Boolean(r));
}

export async function readGetUserLayers(address: string): Promise<InterpretiveLayer[]> {
  if (!isLive) {
    return delay(mockLayers.filter((l) => l.author.toLowerCase() === address.toLowerCase()));
  }
  const idsRaw = await safeReadContract("get_user_layers", [address]);
  const ids = typeof idsRaw === "string" && idsRaw.length > 0 ? idsRaw.split("|") : [];
  const layers = await Promise.all(ids.map((id) => readGetLayer(id)));
  return layers.filter((l): l is InterpretiveLayer => Boolean(l));
}

// ---- Writes ----
// Every write requires the caller to pass the wallet address obtained from useWallet().connect() —
// GenLayer transactions are signed through the injected wallet's provider, not an ephemeral key.

export interface CreateRecordInput {
  title: string;
  base_event_summary: string;
  event_timeframe: string;
  place_or_context: string;
  source_urls: string[];
  sensitivity_level: MemoryRecord["sensitivity_level"];
  visibility_mode: MemoryRecord["visibility_mode"];
}

export interface CreateRecordResult {
  record_id: string;
}

// Calls the OdageContract `create_record` method, which also inscribes the base layer.
export async function writeCreateRecord(
  walletAddress: string,
  input: CreateRecordInput,
): Promise<CreateRecordResult> {
  if (!isLive) {
    await delay(null, 900);
    const record_id = `rec_${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 40)}_${Date.now()
      .toString(36)
      .slice(-4)}`;
    return { record_id };
  }

  const client = await getWriteClient(walletAddress);
  const txHash = await client.writeContract({
    address: CONTRACT_ADDRESS as Address,
    functionName: "create_record",
    args: [
      input.title,
      input.base_event_summary,
      input.event_timeframe,
      input.place_or_context,
      JSON.stringify(input.source_urls),
      input.sensitivity_level,
      input.visibility_mode,
      new Date().toISOString(),
    ],
    value: 0n,
  });
  const receipt = await client.waitForTransactionReceipt({ hash: txHash });
  const record_id = String(extractWriteResult(receipt) ?? "");
  return { record_id };
}

export interface SubmitLayerInput {
  record_id: string;
  layer_title: string;
  layer_text: string;
  perspective_label: string;
  intended_effect: string;
  supporting_sources: string[];
  relation_claimed_by_author: string;
}

export type { SubmitLayerResult } from "./result-decoder";

// Calls the OdageContract `submit_layer` method, which triggers GenLayer's
// non-deterministic consensus review (gl.eq_principle.prompt_non_comparative)
// and returns the placed layer with its consensus verdict.
export async function writeSubmitLayer(
  walletAddress: string,
  input: SubmitLayerInput,
): Promise<SubmitLayerResult> {
  if (!isLive) {
    await delay(null, 1400);
    return {
      layer_id: `layer_${Date.now().toString(36)}`,
      consensus: {
        relationship_category: "needs_human_review",
        visibility_treatment: "human_review_required",
        support_level: "unclear",
        sensitivity: "medium",
        keeps_prior_layers_visible: true,
        requires_warning: false,
        short_reason: "Demo consensus placeholder pending live GenLayer contract integration.",
      },
    };
  }

  const client = await getWriteClient(walletAddress);
  const txHash = await client.writeContract({
    address: CONTRACT_ADDRESS as Address,
    functionName: "submit_layer",
    args: [
      input.record_id,
      input.layer_title,
      input.layer_text,
      input.perspective_label,
      input.intended_effect,
      JSON.stringify(input.supporting_sources),
      input.relation_claimed_by_author,
      new Date().toISOString(),
    ],
    value: 0n,
  });
  const receipt = await client.waitForTransactionReceipt({ hash: txHash });
  return decodeSubmitLayerResult(receipt);
}

export async function writeFlagLayer(
  walletAddress: string,
  layerId: string,
  reason: string,
): Promise<{ ok: true }> {
  if (!isLive) {
    await delay(null, 500);
    return { ok: true };
  }
  const client = await getWriteClient(walletAddress);
  const txHash = await client.writeContract({
    address: CONTRACT_ADDRESS as Address,
    functionName: "flag_layer",
    args: [layerId, reason, new Date().toISOString()],
    value: 0n,
  });
  await client.waitForTransactionReceipt({ hash: txHash });
  return { ok: true };
}
