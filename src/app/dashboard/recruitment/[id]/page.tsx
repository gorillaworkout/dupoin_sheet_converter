import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RecruitmentProgress } from "@/types/hr";
import { RecruitmentDetailClient } from "./recruitment-detail-client";

async function getRecruitment(id: string): Promise<RecruitmentProgress | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/recruitment/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.record || data || null;
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
