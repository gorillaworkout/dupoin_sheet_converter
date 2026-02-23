import type { PipelineStats } from "@/types/hr";
import { HROverviewClient } from "./hr-overview-client";

export const revalidate = 0;

async function getPipelineStats(): Promise<PipelineStats | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/pipeline`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}

export default async function HROverviewPage() {
  const stats = await getPipelineStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          HR Pipeline Overview
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Visualisasi alur proses HR dari request hingga offboarding
        </p>
      </div>
      <HROverviewClient stats={stats} />
    </div>
  );
}
