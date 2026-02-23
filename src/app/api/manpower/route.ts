import { NextResponse } from "next/server";
import {
  getAllRecords,
  createRecord,
  getTableId,
  transformGenericRecord,
  reverseTransform,
} from "@/lib/lark";
import { MANPOWER_FIELDS } from "@/lib/field-mappings";
import type { ManpowerRequest } from "@/types/hr";

export const revalidate = 60;

export async function GET() {
  try {
    const tableId = getTableId("manpower");
    const records = await getAllRecords(tableId);

    const items: ManpowerRequest[] = records.map((record) => {
      const transformed = transformGenericRecord(record, MANPOWER_FIELDS);
      return {
        id: record.record_id,
        ...transformed,
      } as unknown as ManpowerRequest;
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
    console.error("Failed to fetch manpower requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch manpower requests", message: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const tableId = getTableId("manpower");
    const body = await request.json();
    const fields = reverseTransform(body, MANPOWER_FIELDS);
    const recordId = await createRecord(tableId, fields);

    return NextResponse.json(
      { record_id: recordId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create manpower request:", error);
    return NextResponse.json(
      { error: "Failed to create manpower request", message: String(error) },
      { status: 500 }
    );
  }
}
