import { NextResponse } from "next/server";
import {
  getAllRecords,
  createRecord,
  getTableId,
  transformGenericRecord,
  reverseTransform,
} from "@/lib/lark";
import { CANDIDATE_FIELDS } from "@/lib/field-mappings";
import type { Candidate } from "@/types/hr";

export const revalidate = 60;

export async function GET() {
  try {
    const tableId = getTableId("candidate");
    const records = await getAllRecords(tableId);

    const items: Candidate[] = records.map((record) => {
      const transformed = transformGenericRecord(record, CANDIDATE_FIELDS);
      return {
        id: record.record_id,
        ...transformed,
      } as unknown as Candidate;
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
    console.error("Failed to fetch candidates:", error);
    return NextResponse.json(
      { error: "Failed to fetch candidates", message: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const tableId = getTableId("candidate");
    const body = await request.json();
    const fields = reverseTransform(body, CANDIDATE_FIELDS);
    const recordId = await createRecord(tableId, fields);

    return NextResponse.json(
      { record_id: recordId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create candidate:", error);
    return NextResponse.json(
      { error: "Failed to create candidate", message: String(error) },
      { status: 500 }
    );
  }
}
