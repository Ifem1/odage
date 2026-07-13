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
  const data = (receipt as Record<string, unknown>).data;
  if (!data || typeof data !== "object") return "";

  const findLeaderResult = (value: unknown): unknown => {
    if (!value || typeof value !== "object") return undefined;
    const object = value as Record<string, unknown>;
    const leader = object.leader_receipt ?? object.leaderReceipt;
    if (leader && typeof leader === "object" && "result" in leader) {
      return (leader as Record<string, unknown>).result;
    }
    for (const child of Object.values(object)) {
      const found = findLeaderResult(child);
      if (found !== undefined) return found;
    }
    return undefined;
  };

  return findLeaderResult(data) ?? (data as Record<string, unknown>).result ?? "";
}

export function decodeSubmitLayerResult(receipt: unknown): SubmitLayerResult {
  const placedLayer = parseJsonField<InterpretiveLayer | undefined>(extractWriteResult(receipt), undefined);
  if (!placedLayer?.layer_id || !placedLayer.consensus) {
    throw new Error("submit_layer finalized without a decodable layer result");
  }
  return { layer_id: placedLayer.layer_id, consensus: placedLayer.consensus };
}
