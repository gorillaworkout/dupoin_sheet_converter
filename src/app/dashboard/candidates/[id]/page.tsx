import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Candidate } from "@/types/hr";
import { CandidateDetailClient } from "./candidate-detail-client";
import { getRecord, getTableId, transformGenericRecord } from "@/lib/lark";
import { CANDIDATE_FIELDS } from "@/lib/field-mappings";

async function getCandidate(id: string): Promise<Candidate | null> {
  try {
    const tableId = getTableId("candidate");
    const record = await getRecord(tableId, id);
    if (!record) return null;
    return {
      id: record.record_id,
      ...transformGenericRecord(record, CANDIDATE_FIELDS),
    } as unknown as Candidate;
  } catch {
    return null;
  }
}

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getCandidate(id);

  if (!data) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/candidates">
          <Button variant="ghost" size="sm" className="gap-2 text-zinc-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 p-12">
          <p className="text-sm text-red-400">Candidate data not found.</p>
        </div>
      </div>
    );
  }

  return <CandidateDetailClient data={data} />;
}
