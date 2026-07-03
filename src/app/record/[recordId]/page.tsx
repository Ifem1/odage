import { notFound } from "next/navigation";
import { readGetRecord, readGetRecordLayers } from "@/lib/genlayer/client";
import RecordDetailClient from "./RecordDetailClient";

export default async function RecordDetailPage({
  params,
}: {
  params: Promise<{ recordId: string }>;
}) {
  const { recordId } = await params;
  const record = await readGetRecord(recordId);
  if (!record) notFound();
  const layers = await readGetRecordLayers(recordId);

  return <RecordDetailClient record={record} layers={layers} />;
}
