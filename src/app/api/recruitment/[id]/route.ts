import { NextResponse } from "next/server";
import {
  getRecord,
  updateRecord,
  deleteRecord,
  getTableId,
  transformGenericRecord,
  reverseTransform,
} from "@/lib/lark";
import { RECRUITMENT_FIELDS } from "@/lib/field-mappings";
import type { RecruitmentProgress } from "@/types/hr";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tableId = getTableId("recruitment");
    const record = await getRecord(tableId, id);

    if (!record) {
      return NextResponse.json(
        { error: "Recruitment record not found" },
        { status: 404 }
      );
    }

    const transformed = transformGenericRecord(record, RECRUITMENT_FIELDS);
    const item = { id: record.record_id, ...transformed } as unknown as RecruitmentProgress;

    return NextResponse.json({ data: item });
  } catch (error) {
    console.error("Failed to fetch recruitment record:", error);
    return NextResponse.json(
      { error: "Failed to fetch recruitment record", message: String(error) },
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
    const tableId = getTableId("recruitment");
    const body = await request.json();
    const fields = reverseTransform(body, RECRUITMENT_FIELDS);
    await updateRecord(tableId, id, fields);

    return NextResponse.json({ success: true, record_id: id });
  } catch (error) {
    console.error("Failed to update recruitment record:", error);
    return NextResponse.json(
      { error: "Failed to update recruitment record", message: String(error) },
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
    const tableId = getTableId("recruitment");
    await deleteRecord(tableId, id);

    return NextResponse.json({ success: true, record_id: id });
  } catch (error) {
    console.error("Failed to delete recruitment record:", error);
    return NextResponse.json(
      { error: "Failed to delete recruitment record", message: String(error) },
      { status: 500 }
    );
  }
}
