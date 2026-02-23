import type { Candidate } from "@/types/hr";
import { CandidateTable } from "./candidate-table";

export const revalidate = 0;

async function getCandidates(): Promise<Candidate[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/candidates`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.records || data || [];
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
