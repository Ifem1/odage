import type { InterpretiveLayer } from "../types";

export interface SubmitLayerResult {
  layer_id: string;
  consensus: InterpretiveLayer["consensus"];
}

export function parseJsonField<T>(raw: unknown, fallback: T): T {
  if (typeof raw !== "string" || raw === "") return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function extractWriteResult(receipt: unknown): unknown {
  if (!receipt || typeof receipt !== "object") return "";
  const transaction = receipt as Record<string, unknown>;

  const findLeaderResult = (value: unknown): unknown => {
    if (!value || typeof value !== "object") return undefined;
    const object = value as Record<string, unknown>;
    const leader = object.leader_receipt ?? object.leaderReceipt;
    const leaderEntry = Array.isArray(leader) ? leader[0] : leader;
    if (leaderEntry && typeof leaderEntry === "object" && "result" in leaderEntry) {
      const result = (leaderEntry as Record<string, unknown>).result;
      if (result && typeof result === "object") {
        const payload = (result as Record<string, unknown>).payload;
        if (payload && typeof payload === "object" && "readable" in payload) {
          const readable = (payload as Record<string, unknown>).readable;
          if (typeof readable === "string") {
            try {
              return JSON.parse(readable);
            } catch {
              return readable;
            }
          }
        }
      }
      return result;
    }
    for (const child of Object.values(object)) {
      const found = findLeaderResult(child);
      if (found !== undefined) return found;
    }
    return undefined;
  };

  return findLeaderResult(transaction) ?? "";
}

export function decodeSubmitLayerResult(receipt: unknown): SubmitLayerResult {
  const placedLayer = parseJsonField<InterpretiveLayer | undefined>(extractWriteResult(receipt), undefined);
  if (!placedLayer?.layer_id || !placedLayer.consensus) {
    throw new Error("submit_layer finalized without a decodable layer result");
  }
  return { layer_id: placedLayer.layer_id, consensus: placedLayer.consensus };
}
