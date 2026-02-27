import { XeroClient } from "./xero-client";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default function XeroPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Xero Financial Reports
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Balance Sheet and Profit & Loss from Xero
        </p>
      </div>
      <XeroClient />
    </div>
  );
}
