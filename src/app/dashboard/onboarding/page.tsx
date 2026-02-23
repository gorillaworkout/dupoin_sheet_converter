import type { OnboardingRecord } from "@/types/hr";
import { OnboardingTable } from "./onboarding-table";
import { getAllRecords, getTableId, transformGenericRecord } from "@/lib/lark";
import { ONBOARDING_FIELDS } from "@/lib/field-mappings";

export const revalidate = 0;

async function getOnboarding(): Promise<OnboardingRecord[]> {
  try {
    const tableId = getTableId("onboarding");
    const records = await getAllRecords(tableId);
    return records.map((record) => ({
      id: record.record_id,
      ...transformGenericRecord(record, ONBOARDING_FIELDS),
    })) as unknown as OnboardingRecord[];
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
