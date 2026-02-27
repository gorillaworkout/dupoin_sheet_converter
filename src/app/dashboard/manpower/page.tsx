import type { ManpowerRequest } from "@/types/hr";
import { ManpowerTable } from "./manpower-table";
import { getAllRecords, getTableId, transformGenericRecord } from "@/lib/lark";
import { MANPOWER_FIELDS } from "@/lib/field-mappings";

export const revalidate = 0;

async function getManpowerRequests(): Promise<ManpowerRequest[]> {
  try {
    const tableId = getTableId("manpower");
    const records = await getAllRecords(tableId);
    return records.map((record) => ({
      id: record.record_id,
      ...transformGenericRecord(record, MANPOWER_FIELDS),
    })) as unknown as ManpowerRequest[];
  } catch {
    return [];
  }
}

export default async function ManpowerPage() {
  const requests = await getManpowerRequests();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Manpower Requests
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {requests.length} manpower requests
        </p>
      </div>
      <ManpowerTable requests={requests} />
    </div>
  );
}
