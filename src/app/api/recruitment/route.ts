import { NextResponse } from "next/server";
import {
  getAllRecords,
  createRecord,
  getTableId,
  transformGenericRecord,
  reverseTransform,
} from "@/lib/lark";
import { RECRUITMENT_FIELDS } from "@/lib/field-mappings";
import type { RecruitmentProgress } from "@/types/hr";

export const revalidate = 60;

export async function GET() {
  try {
    const tableId = getTableId("recruitment");
    const records = await getAllRecords(tableId);

    const items: RecruitmentProgress[] = records.map((record) => {
      const transformed = transformGenericRecord(record, RECRUITMENT_FIELDS);
      return {
        id: record.record_id,
        ...transformed,
      } as unknown as RecruitmentProgress;
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
    console.error("Failed to fetch recruitment progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch recruitment progress", message: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const tableId = getTableId("recruitment");
    const body = await request.json();
    const fields = reverseTransform(body, RECRUITMENT_FIELDS);
    const recordId = await createRecord(tableId, fields);

    return NextResponse.json(
      { record_id: recordId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create recruitment progress:", error);
    return NextResponse.json(
      { error: "Failed to create recruitment progress", message: String(error) },
      { status: 500 }
    );
  }
}
