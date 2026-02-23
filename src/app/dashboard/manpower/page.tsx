import type { ManpowerRequest } from "@/types/hr";
import { ManpowerTable } from "./manpower-table";

export const revalidate = 0;

async function getManpowerRequests(): Promise<ManpowerRequest[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/manpower`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
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
