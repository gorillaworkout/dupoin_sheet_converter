import type { OffboardingRecord } from "@/types/hr";
import { OffboardingTable } from "./offboarding-table";

export const revalidate = 0;

async function getOffboarding(): Promise<OffboardingRecord[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/offboarding`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.records || data || [];
  } catch {
    return [];
  }
}

export default async function OffboardingPage() {
  const records = await getOffboarding();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Offboarding
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {records.length} proses offboarding
        </p>
      </div>
      <OffboardingTable records={records} />
    </div>
  );
}
