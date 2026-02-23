import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getRecord, transformRecord } from "@/lib/lark";
import type { Employee } from "@/types/employee";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";

interface FieldItem {
  label: string;
  value: string;
}

function InfoField({ label, value }: FieldItem) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </dt>
      <dd className="text-sm text-zinc-200">{value || "—"}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toLowerCase().trim();

  if (normalized === "active") {
    return (
      <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
        Active
      </Badge>
    );
  }

  if (normalized === "inactive" || normalized === "terminated") {
    return (
      <Badge className="border-red-500/20 bg-red-500/10 text-red-400">
        {status}
      </Badge>
    );
  }

  return (
    <Badge className="border-zinc-500/20 bg-zinc-500/10 text-zinc-400">
      {status || "—"}
    </Badge>
  );
}

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let employee: Employee;

  try {
    const record = await getRecord(id);
    if (!record) notFound();
    employee = transformRecord(record) as unknown as Employee;
  } catch (error) {
    console.error("Failed to fetch employee:", error);
    return (
      <div className="space-y-6">
        <Link href="/dashboard/employees">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 p-12">
          <p className="text-sm text-red-400">
            Failed to load employee data. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/employees">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      {/* Employee name & status */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-xl font-bold text-white shadow-lg shadow-cyan-500/20">
          {employee.full_name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "?"}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {employee.full_name || "Employee"}
          </h1>
          <div className="mt-1 flex items-center gap-3">
            {employee.job_title && (
              <span className="text-sm text-zinc-400">
                {employee.job_title}
              </span>
            )}
            <StatusBadge status={employee.status} />
          </div>
        </div>
      </div>

      {/* Detail cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Personal Info */}
        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <InfoField label="Full Name" value={employee.full_name} />
              <InfoField label="Nickname (WF)" value={employee.nickname} />
              <InfoField label="UUID" value={employee.uuid} />
              <InfoField label="Gender" value={employee.gender} />
              <InfoField label="Nationality" value={employee.nationality} />
              <InfoField label="City" value={employee.city} />
            </dl>
          </CardContent>
        </Card>

        {/* Work Info */}
        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
              Work Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <InfoField label="Company" value={employee.company} />
              <InfoField label="Job Title" value={employee.job_title} />
              <InfoField
                label="Primary Department"
                value={employee.primary_department}
              />
              <InfoField label="Workforce Type" value={employee.workforce_type} />
              <InfoField label="Seats" value={employee.seats} />
              <InfoField
                label="Date of Joining"
                value={employee.date_of_joining}
              />
            </dl>
          </CardContent>
        </Card>

        {/* Status */}
        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-1">
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Status
                </dt>
                <dd>
                  <StatusBadge status={employee.status} />
                </dd>
              </div>
              <InfoField
                label="Offboarding Status"
                value={employee.offboarding_status}
              />
            </dl>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-y-4">
              <InfoField label="Work Email" value={employee.work_email} />
              <InfoField
                label="Business Email"
                value={employee.business_email}
              />
              <InfoField label="Phone Number" value={employee.phone_number} />
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
