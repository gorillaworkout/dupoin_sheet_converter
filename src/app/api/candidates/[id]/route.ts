import { NextResponse } from "next/server";
import {
  getRecord,
  updateRecord,
  deleteRecord,
  getTableId,
  transformGenericRecord,
  reverseTransform,
} from "@/lib/lark";
import { CANDIDATE_FIELDS } from "@/lib/field-mappings";
import type { Candidate } from "@/types/hr";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tableId = getTableId("candidate");
    const record = await getRecord(tableId, id);

    if (!record) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    const transformed = transformGenericRecord(record, CANDIDATE_FIELDS);
    const item = { id: record.record_id, ...transformed } as unknown as Candidate;

    return NextResponse.json({ data: item });
  } catch (error) {
    console.error("Failed to fetch candidate:", error);
    return NextResponse.json(
      { error: "Failed to fetch candidate", message: String(error) },
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
    const tableId = getTableId("candidate");
    const body = await request.json();
    const fields = reverseTransform(body, CANDIDATE_FIELDS);
    await updateRecord(tableId, id, fields);

    return NextResponse.json({ success: true, record_id: id });
  } catch (error) {
    console.error("Failed to update candidate:", error);
    return NextResponse.json(
      { error: "Failed to update candidate", message: String(error) },
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
    const tableId = getTableId("candidate");
    await deleteRecord(tableId, id);

    return NextResponse.json({ success: true, record_id: id });
  } catch (error) {
    console.error("Failed to delete candidate:", error);
    return NextResponse.json(
      { error: "Failed to delete candidate", message: String(error) },
      { status: 500 }
    );
  }
}
