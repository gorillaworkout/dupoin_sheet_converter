import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OnboardingRecord } from "@/types/hr";
import { OnboardingDetailClient } from "./onboarding-detail-client";
import { getRecord, getTableId, transformGenericRecord } from "@/lib/lark";
import { ONBOARDING_FIELDS } from "@/lib/field-mappings";

async function getOnboarding(id: string): Promise<OnboardingRecord | null> {
  try {
    const tableId = getTableId("onboarding");
    const record = await getRecord(tableId, id);
    if (!record) return null;
    return {
      id: record.record_id,
      ...transformGenericRecord(record, ONBOARDING_FIELDS),
    } as unknown as OnboardingRecord;
  } catch {
    return null;
  }
}

export default async function OnboardingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getOnboarding(id);

  if (!data) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/onboarding">
          <Button variant="ghost" size="sm" className="gap-2 text-zinc-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 p-12">
          <p className="text-sm text-red-400">Data onboarding tidak ditemukan.</p>
        </div>
      </div>
    );
  }

  return <OnboardingDetailClient data={data} />;
}
