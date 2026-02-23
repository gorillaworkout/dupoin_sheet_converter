import { NextResponse } from "next/server";
import {
  getAllRecords,
  createRecord,
  getTableId,
  transformGenericRecord,
  reverseTransform,
} from "@/lib/lark";
import { OFFBOARDING_FIELDS } from "@/lib/field-mappings";
import type { OffboardingRecord } from "@/types/hr";

export const revalidate = 60;

export async function GET() {
  try {
    const tableId = getTableId("offboarding");
    const records = await getAllRecords(tableId);

    const items: OffboardingRecord[] = records.map((record) => {
      const transformed = transformGenericRecord(record, OFFBOARDING_FIELDS);
      return {
        id: record.record_id,
        ...transformed,
      } as unknown as OffboardingRecord;
    });

    return NextResponse.json(
      { data: items, total: items.length },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch offboarding records:", error);
    return NextResponse.json(
      { error: "Failed to fetch offboarding records", message: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const tableId = getTableId("offboarding");
    const body = await request.json();
    const fields = reverseTransform(body, OFFBOARDING_FIELDS);
    const recordId = await createRecord(tableId, fields);

    return NextResponse.json(
      { record_id: recordId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create offboarding record:", error);
    return NextResponse.json(
      { error: "Failed to create offboarding record", message: String(error) },
      { status: 500 }
    );
  }
}
