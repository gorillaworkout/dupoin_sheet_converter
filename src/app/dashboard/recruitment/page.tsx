import type { RecruitmentProgress } from "@/types/hr";
import { RecruitmentTable } from "./recruitment-table";
import { getAllRecords, getTableId, transformGenericRecord } from "@/lib/lark";
import { RECRUITMENT_FIELDS } from "@/lib/field-mappings";

export const revalidate = 0;

async function getRecruitment(): Promise<RecruitmentProgress[]> {
  try {
    const tableId = getTableId("recruitment");
    const records = await getAllRecords(tableId);
    return records.map((record) => ({
      id: record.record_id,
      ...transformGenericRecord(record, RECRUITMENT_FIELDS),
    })) as unknown as RecruitmentProgress[];
  } catch {
    return [];
  }
}

export default async function RecruitmentPage() {
  const records = await getRecruitment();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Recruitment
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {records.length} recruitment processes
        </p>
      </div>
      <RecruitmentTable records={records} />
    </div>
  );
}
