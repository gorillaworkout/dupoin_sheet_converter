import { NextResponse } from "next/server";
import {
  getAllRecords,
  createRecord,
  getTableId,
  transformGenericRecord,
  reverseTransform,
} from "@/lib/lark";
import { ONBOARDING_FIELDS } from "@/lib/field-mappings";
import type { OnboardingRecord } from "@/types/hr";

export const revalidate = 60;

export async function GET() {
  try {
    const tableId = getTableId("onboarding");
    const records = await getAllRecords(tableId);

    const items: OnboardingRecord[] = records.map((record) => {
      const transformed = transformGenericRecord(record, ONBOARDING_FIELDS);
      return {
        id: record.record_id,
        ...transformed,
      } as unknown as OnboardingRecord;
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
    console.error("Failed to fetch onboarding records:", error);
    return NextResponse.json(
      { error: "Failed to fetch onboarding records", message: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const tableId = getTableId("onboarding");
    const body = await request.json();
    const fields = reverseTransform(body, ONBOARDING_FIELDS);
    const recordId = await createRecord(tableId, fields);

    return NextResponse.json(
      { record_id: recordId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create onboarding record:", error);
    return NextResponse.json(
      { error: "Failed to create onboarding record", message: String(error) },
      { status: 500 }
    );
  }
}
