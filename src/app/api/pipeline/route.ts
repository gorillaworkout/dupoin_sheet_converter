import { NextResponse } from "next/server";
import {
  getAllRecords,
  getTableId,
  normalizeFieldValue,
} from "@/lib/lark";
import type { PipelineStats } from "@/types/hr";

export const revalidate = 60;

function countByField(
  records: { fields: Record<string, unknown> }[],
  fieldName: string,
  matchValues: Record<string, string[]>
): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const key of Object.keys(matchValues)) {
    counts[key] = 0;
  }

  for (const record of records) {
    const value = normalizeFieldValue(record.fields[fieldName]).toLowerCase();
    for (const [key, matchers] of Object.entries(matchValues)) {
      if (matchers.some((m) => value.includes(m.toLowerCase()))) {
        counts[key]++;
      }
    }
  }

  return counts;
}

export async function GET() {
  try {
    // Fetch all tables in parallel
    const [
      manpowerRecords,
      recruitmentRecords,
      candidateRecords,
      onboardingRecords,
      employeeRecords,
      offboardingRecords,
    ] = await Promise.all([
      getAllRecords(getTableId("manpower")),
      getAllRecords(getTableId("recruitment")),
      getAllRecords(getTableId("candidate")),
      getAllRecords(getTableId("onboarding")),
      getAllRecords(getTableId("employee")),
      getAllRecords(getTableId("offboarding")),
    ]);

    // Manpower counts
    const manpowerCounts = countByField(manpowerRecords, "Status", {
      pending: ["pending"],
      approved: ["approved"],
    });

    // Recruitment counts
    const recruitmentCounts = countByField(recruitmentRecords, "Status", {
      in_progress: ["active", "open", "in progress"],
      completed: ["closed", "completed", "filled"],
    });

    // Candidate counts
    const candidateCounts = countByField(candidateRecords, "Status", {
      shortlisted: ["shortlisted", "shortlist"],
      offered: ["offered", "offer sent", "offer"],
    });

    // Onboarding counts
    const onboardingCounts = countByField(onboardingRecords, "Completed", {
      completed: ["yes", "completed", "done"],
    });

    // Employee counts
    const employeeCounts = countByField(employeeRecords, "Status", {
      active: ["active"],
    });

    // Offboarding counts
    const offboardingCounts = countByField(offboardingRecords, "Offboarded", {
      completed: ["yes", "completed", "done"],
    });

    const summary: PipelineStats = {
      manpower: {
        total: manpowerRecords.length,
        pending: manpowerCounts.pending,
        approved: manpowerCounts.approved,
      },
      recruitment: {
        total: recruitmentRecords.length,
        in_progress: recruitmentCounts.in_progress,
        completed: recruitmentCounts.completed,
      },
      candidates: {
        total: candidateRecords.length,
        shortlisted: candidateCounts.shortlisted,
        offered: candidateCounts.offered,
      },
      onboarding: {
        total: onboardingRecords.length,
        in_progress: onboardingRecords.length - onboardingCounts.completed,
        completed: onboardingCounts.completed,
      },
      employees: {
        total: employeeRecords.length,
        active: employeeCounts.active,
      },
      offboarding: {
        total: offboardingRecords.length,
        in_progress: offboardingRecords.length - offboardingCounts.completed,
        completed: offboardingCounts.completed,
      },
    };

    return NextResponse.json(summary, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("Failed to fetch pipeline summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch pipeline summary", message: String(error) },
      { status: 500 }
    );
  }
}
