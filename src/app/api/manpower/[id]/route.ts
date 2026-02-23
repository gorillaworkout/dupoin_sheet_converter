import { NextResponse } from "next/server";
import {
  getRecord,
  updateRecord,
  deleteRecord,
  getTableId,
  transformGenericRecord,
  reverseTransform,
} from "@/lib/lark";
import { MANPOWER_FIELDS } from "@/lib/field-mappings";
import type { ManpowerRequest } from "@/types/hr";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tableId = getTableId("manpower");
    const record = await getRecord(tableId, id);

    if (!record) {
      return NextResponse.json(
        { error: "Manpower request not found" },
        { status: 404 }
      );
    }

    const transformed = transformGenericRecord(record, MANPOWER_FIELDS);
    const item = { id: record.record_id, ...transformed } as unknown as ManpowerRequest;

    return NextResponse.json({ data: item });
  } catch (error) {
    console.error("Failed to fetch manpower request:", error);
    return NextResponse.json(
      { error: "Failed to fetch manpower request", message: String(error) },
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
    const tableId = getTableId("manpower");
    const body = await request.json();
    const fields = reverseTransform(body, MANPOWER_FIELDS);
    await updateRecord(tableId, id, fields);

    return NextResponse.json({ success: true, record_id: id });
  } catch (error) {
    console.error("Failed to update manpower request:", error);
    return NextResponse.json(
      { error: "Failed to update manpower request", message: String(error) },
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
    const tableId = getTableId("manpower");
    await deleteRecord(tableId, id);

    return NextResponse.json({ success: true, record_id: id });
  } catch (error) {
    console.error("Failed to delete manpower request:", error);
    return NextResponse.json(
      { error: "Failed to delete manpower request", message: String(error) },
      { status: 500 }
    );
  }
}
