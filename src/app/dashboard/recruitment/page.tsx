import type { RecruitmentProgress } from "@/types/hr";
import { RecruitmentTable } from "./recruitment-table";

export const revalidate = 0;

async function getRecruitment(): Promise<RecruitmentProgress[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/recruitment`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.records || data || [];
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
