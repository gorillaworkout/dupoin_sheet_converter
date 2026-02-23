import { NextResponse } from "next/server";
import {
  getRecord,
  updateRecord,
  deleteRecord,
  getTableId,
  transformRecord,
  reverseTransform,
} from "@/lib/lark";
import { EMPLOYEE_FIELDS } from "@/lib/field-mappings";
import type { Employee } from "@/types/employee";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const record = await getRecord(id);

    if (!record) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    const employee = transformRecord(record) as unknown as Employee;

    return NextResponse.json({ employee });
  } catch (error) {
    console.error("Failed to fetch employee:", error);
    return NextResponse.json(
      { error: "Failed to fetch employee", message: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tableId = getTableId("employee");
    const body = await request.json();
    const fields = reverseTransform(body, EMPLOYEE_FIELDS);
    
    // Remove read-only fields that Lark won't accept writes to
    // type 1005=autoId, 18=link, 15=email, 20=formula, 19=lookup, 11=person
    const readOnlyFields = [
      "UUID", "Nationality", "Work Email", "Offboarding ID", "Onboarding ID",
      "Job Category", "Length Of Service", "Direct Manager ( Person )",
    ];
    for (const f of readOnlyFields) {
      delete (fields as Record<string, unknown>)[f];
    }
    
    await updateRecord(tableId, id, fields);

    return NextResponse.json({ success: true, record_id: id });
  } catch (error) {
    console.error("Failed to update employee:", error);
    return NextResponse.json(
      { error: "Failed to update employee", message: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tableId = getTableId("employee");
    await deleteRecord(tableId, id);

    return NextResponse.json({ success: true, record_id: id });
  } catch (error) {
    console.error("Failed to delete employee:", error);
    return NextResponse.json(
      { error: "Failed to delete employee", message: String(error) },
      { status: 500 }
    );
  }
}
