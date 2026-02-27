import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RecruitmentProgress } from "@/types/hr";
import { RecruitmentDetailClient } from "./recruitment-detail-client";
import { getRecord, getTableId, transformGenericRecord } from "@/lib/lark";
import { RECRUITMENT_FIELDS } from "@/lib/field-mappings";

async function getRecruitment(id: string): Promise<RecruitmentProgress | null> {
  try {
    const tableId = getTableId("recruitment");
    const record = await getRecord(tableId, id);
    if (!record) return null;
    return {
      id: record.record_id,
      ...transformGenericRecord(record, RECRUITMENT_FIELDS),
    } as unknown as RecruitmentProgress;
  } catch {
    return null;
  }
}

export default async function RecruitmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getRecruitment(id);

  if (!data) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/recruitment">
          <Button variant="ghost" size="sm" className="gap-2 text-zinc-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 p-12">
          <p className="text-sm text-red-400">Recruitment data not found.</p>
        </div>
      </div>
    );
  }

  return <RecruitmentDetailClient data={data} />;
}
