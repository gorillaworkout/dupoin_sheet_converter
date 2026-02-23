import type { PipelineStats } from "@/types/hr";
import { HROverviewClient } from "./hr-overview-client";
import { getAllRecords, getTableId, normalizeFieldValue } from "@/lib/lark";

export const revalidate = 0;

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

async function getPipelineStats(): Promise<PipelineStats | null> {
  try {
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

    const manpowerCounts = countByField(manpowerRecords, "Status", {
      pending: ["pending"],
      approved: ["approved"],
    });

    const recruitmentCounts = countByField(recruitmentRecords, "Status", {
      in_progress: ["active", "open", "in progress"],
      completed: ["closed", "completed", "filled"],
    });

    const candidateCounts = countByField(candidateRecords, "Status", {
      shortlisted: ["shortlisted", "shortlist"],
      offered: ["offered", "offer sent", "offer"],
    });

    const onboardingCounts = countByField(onboardingRecords, "Completed", {
      completed: ["yes", "completed", "done"],
    });

    const employeeCounts = countByField(employeeRecords, "Status", {
      active: ["active"],
    });

    const offboardingCounts = countByField(offboardingRecords, "Offboarded", {
      completed: ["yes", "completed", "done"],
    });

    return {
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
  } catch {
    return null;
  }
}

export default async function HROverviewPage() {
  const stats = await getPipelineStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          HR Pipeline Overview
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Complete HR pipeline from request to offboarding
        </p>
      </div>
      <HROverviewClient stats={stats} />
    </div>
  );
}
