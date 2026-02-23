import { NextResponse } from "next/server";
import {
  getAllRecords,
  createRecord,
  getTableId,
  transformRecord,
  reverseTransform,
} from "@/lib/lark";
import { EMPLOYEE_FIELDS } from "@/lib/field-mappings";
import type { Employee, EmployeesResponse } from "@/types/employee";

export const revalidate = 60;

export async function GET() {
  try {
    const records = await getAllRecords();

    const employees: Employee[] = records.map((record) => {
      const transformed = transformRecord(record);
      return transformed as unknown as Employee;
    });

    const activeCount = employees.filter(
      (e) => e.status?.toLowerCase() === "active"
    ).length;

    const response: EmployeesResponse = {
      employees,
      total: employees.length,
      active_count: activeCount,
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees", message: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const tableId = getTableId("employee");
    const body = await request.json();
    const fields = reverseTransform(body, EMPLOYEE_FIELDS);
    const recordId = await createRecord(tableId, fields);

    return NextResponse.json(
      { record_id: recordId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create employee:", error);
    return NextResponse.json(
      { error: "Failed to create employee", message: String(error) },
      { status: 500 }
    );
  }
}
