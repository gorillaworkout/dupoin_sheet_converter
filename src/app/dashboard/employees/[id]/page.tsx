import { getRecord, transformRecord } from "@/lib/lark";
import type { Employee } from "@/types/employee";
import { notFound } from "next/navigation";
import { EmployeeDetailClient } from "./employee-detail-client";

export const revalidate = 0;

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let employee: Employee;

  try {
    const record = await getRecord(id);
    if (!record) notFound();
    employee = transformRecord(record) as unknown as Employee;
  } catch (error) {
    console.error("Failed to fetch employee:", error);
    return (
      <div className="flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 p-12">
        <p className="text-sm text-red-400">
          Failed to load employee data. Please try again.
        </p>
      </div>
    );
  }

  return <EmployeeDetailClient employee={employee} recordId={id} />;
}
