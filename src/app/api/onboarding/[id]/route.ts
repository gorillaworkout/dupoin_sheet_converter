import { NextResponse } from "next/server";
import {
  getRecord,
  updateRecord,
  deleteRecord,
  getTableId,
  transformGenericRecord,
  reverseTransform,
} from "@/lib/lark";
import { ONBOARDING_FIELDS } from "@/lib/field-mappings";
import type { OnboardingRecord } from "@/types/hr";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tableId = getTableId("onboarding");
    const record = await getRecord(tableId, id);

    if (!record) {
      return NextResponse.json(
        { error: "Onboarding record not found" },
        { status: 404 }
      );
    }

    const transformed = transformGenericRecord(record, ONBOARDING_FIELDS);
    const item = { id: record.record_id, ...transformed } as unknown as OnboardingRecord;

    return NextResponse.json({ data: item });
  } catch (error) {
    console.error("Failed to fetch onboarding record:", error);
    return NextResponse.json(
      { error: "Failed to fetch onboarding record", message: String(error) },
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
    const tableId = getTableId("onboarding");
    const body = await request.json();
    const fields = reverseTransform(body, ONBOARDING_FIELDS);
    await updateRecord(tableId, id, fields);

    return NextResponse.json({ success: true, record_id: id });
  } catch (error) {
    console.error("Failed to update onboarding record:", error);
    return NextResponse.json(
      { error: "Failed to update onboarding record", message: String(error) },
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
    const tableId = getTableId("onboarding");
    await deleteRecord(tableId, id);

    return NextResponse.json({ success: true, record_id: id });
  } catch (error) {
    console.error("Failed to delete onboarding record:", error);
    return NextResponse.json(
      { error: "Failed to delete onboarding record", message: String(error) },
      { status: 500 }
    );
  }
}
