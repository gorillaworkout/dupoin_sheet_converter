import { NextResponse } from "next/server";
import {
  getRecord,
  updateRecord,
  deleteRecord,
  getTableId,
  transformGenericRecord,
  reverseTransform,
} from "@/lib/lark";
import { OFFBOARDING_FIELDS } from "@/lib/field-mappings";
import type { OffboardingRecord } from "@/types/hr";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tableId = getTableId("offboarding");
    const record = await getRecord(tableId, id);

    if (!record) {
      return NextResponse.json(
        { error: "Offboarding record not found" },
        { status: 404 }
      );
    }

    const transformed = transformGenericRecord(record, OFFBOARDING_FIELDS);
    const item = { id: record.record_id, ...transformed } as unknown as OffboardingRecord;

    return NextResponse.json({ data: item });
  } catch (error) {
    console.error("Failed to fetch offboarding record:", error);
    return NextResponse.json(
      { error: "Failed to fetch offboarding record", message: String(error) },
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
    const tableId = getTableId("offboarding");
    const body = await request.json();
    const fields = reverseTransform(body, OFFBOARDING_FIELDS);
    await updateRecord(tableId, id, fields);

    return NextResponse.json({ success: true, record_id: id });
  } catch (error) {
    console.error("Failed to update offboarding record:", error);
    return NextResponse.json(
      { error: "Failed to update offboarding record", message: String(error) },
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
    const tableId = getTableId("offboarding");
    await deleteRecord(tableId, id);

    return NextResponse.json({ success: true, record_id: id });
  } catch (error) {
    console.error("Failed to delete offboarding record:", error);
    return NextResponse.json(
      { error: "Failed to delete offboarding record", message: String(error) },
      { status: 500 }
    );
  }
}
