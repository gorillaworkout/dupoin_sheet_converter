import type { OffboardingRecord } from "@/types/hr";
import { OffboardingTable } from "./offboarding-table";
import { getAllRecords, getTableId, transformGenericRecord } from "@/lib/lark";
import { OFFBOARDING_FIELDS } from "@/lib/field-mappings";

export const revalidate = 0;

async function getOffboarding(): Promise<OffboardingRecord[]> {
  try {
    const tableId = getTableId("offboarding");
    const records = await getAllRecords(tableId);
    return records.map((record) => ({
      id: record.record_id,
      ...transformGenericRecord(record, OFFBOARDING_FIELDS),
    })) as unknown as OffboardingRecord[];
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
