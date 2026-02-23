import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OffboardingRecord } from "@/types/hr";
import { OffboardingDetailClient } from "./offboarding-detail-client";

async function getOffboarding(id: string): Promise<OffboardingRecord | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/offboarding/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.record || data || null;
  } catch {
    return null;
  }
}

export default async function OffboardingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getOffboarding(id);

  if (!data) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/offboarding">
          <Button variant="ghost" size="sm" className="gap-2 text-zinc-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 p-12">
          <p className="text-sm text-red-400">Data offboarding tidak ditemukan.</p>
        </div>
      </div>
    );
  }

  return <OffboardingDetailClient data={data} />;
}
