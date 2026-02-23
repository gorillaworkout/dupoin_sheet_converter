import type { OnboardingRecord } from "@/types/hr";
import { OnboardingTable } from "./onboarding-table";

export const revalidate = 0;

async function getOnboarding(): Promise<OnboardingRecord[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/onboarding`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.records || data || [];
  } catch {
    return [];
  }
}

export default async function OnboardingPage() {
  const records = await getOnboarding();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Onboarding
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {records.length} proses onboarding
        </p>
      </div>
      <OnboardingTable records={records} />
    </div>
  );
}
