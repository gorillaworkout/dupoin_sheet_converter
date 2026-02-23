import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import type { ManpowerRequest } from "@/types/hr";
import { ManpowerDetailClient } from "./manpower-detail-client";

async function getManpowerRequest(id: string): Promise<ManpowerRequest | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/manpower/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.record || data || null;
  } catch {
    return null;
  }
}

export default async function ManpowerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getManpowerRequest(id);

  if (!data) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/manpower">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 p-12">
          <p className="text-sm text-red-400">
            Data manpower request tidak ditemukan.
          </p>
        </div>
      </div>
    );
  }

  return <ManpowerDetailClient data={data} />;
}
