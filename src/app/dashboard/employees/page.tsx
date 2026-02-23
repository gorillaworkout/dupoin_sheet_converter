import { getAllRecords, transformRecord } from "@/lib/lark";
import type { Employee } from "@/types/employee";
import { EmployeeTable } from "./employee-table";

export const revalidate = 60;

export default async function EmployeesPage() {
  let employees: Employee[] = [];
  let error: string | null = null;

  try {
    const records = await getAllRecords();
    employees = records.map(
      (record) => transformRecord(record) as unknown as Employee
    );
  } catch (e) {
    console.error("Failed to fetch employees:", e);
    error = "Failed to load employee data. Please try again.";
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Employees
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Employee data from Lark Base
          </p>
        </div>
        <div className="flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 p-12">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Employees
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {employees.length} employees registered from Lark Base
        </p>
      </div>
      <EmployeeTable employees={employees} />
    </div>
  );
}
