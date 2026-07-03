import { notFound } from "next/navigation";
import { readGetRecord } from "@/lib/genlayer/client";
import AddLayerClient from "./AddLayerClient";

export default async function AddLayerPage({
  params,
}: {
  params: Promise<{ recordId: string }>;
}) {
  const { recordId } = await params;
  const record = await readGetRecord(recordId);
  if (!record) notFound();

  return <AddLayerClient record={record} />;
}
