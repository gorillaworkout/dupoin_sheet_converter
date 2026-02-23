import type { Candidate } from "@/types/hr";
import { CandidateTable } from "./candidate-table";
import { getAllRecords, getTableId, transformGenericRecord } from "@/lib/lark";
import { CANDIDATE_FIELDS } from "@/lib/field-mappings";

export const revalidate = 0;

async function getCandidates(): Promise<Candidate[]> {
  try {
    const tableId = getTableId("candidate");
    const records = await getAllRecords(tableId);
    return records.map((record) => ({
      id: record.record_id,
      ...transformGenericRecord(record, CANDIDATE_FIELDS),
    })) as unknown as Candidate[];
  } catch {
    return [];
  }
}

export default async function CandidatesPage() {
  const candidates = await getCandidates();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Candidates
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {candidates.length} candidates registered
        </p>
      </div>
      <CandidateTable candidates={candidates} />
    </div>
  );
}
