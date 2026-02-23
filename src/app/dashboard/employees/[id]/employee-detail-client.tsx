"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import type { Employee } from "@/types/employee";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormDialog, type FieldDefinition } from "@/components/dashboard/form-dialog";
import { EMPLOYEE_FORM_FIELDS } from "@/lib/employee-form-fields";
import { DeleteDialog } from "@/components/dashboard/delete-dialog";

function InfoField({ label, value }: { label: string; value: string }) {
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


interface EmployeeDetailClientProps {
  employee: Employee;
  recordId: string;
}

export function EmployeeDetailClient({ employee, recordId }: EmployeeDetailClientProps) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  async function handleUpdate(data: Record<string, string>) {
    const res = await fetch(`/api/employees/${recordId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update employee");
    router.refresh();
  }

  async function handleDelete() {
    const res = await fetch(`/api/employees/${recordId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete employee");
    router.push("/dashboard/employees");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/employees">
            <Button variant="ghost" size="sm" className="gap-2 text-zinc-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            onClick={() => setShowEdit(true)}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
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
              <span className="text-sm text-zinc-400">{employee.job_title}</span>
            )}
            <StatusBadge status={employee.status} />
          </div>
        </div>
      </div>

      {/* Detail cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
              <InfoField label="Primary Department" value={employee.primary_department} />
              <InfoField label="Workforce Type" value={employee.workforce_type} />
              <InfoField label="Seats" value={employee.seats} />
              <InfoField label="Date of Joining" value={employee.date_of_joining} />
            </dl>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-1">
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">Status</dt>
                <dd><StatusBadge status={employee.status} /></dd>
              </div>
              <InfoField label="Offboarding Status" value={employee.offboarding_status} />
            </dl>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-y-4">
              <InfoField label="Work Email" value={employee.work_email} />
              <InfoField label="Business Email" value={employee.business_email} />
              <InfoField label="Phone Number" value={employee.phone_number} />
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <FormDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        title="Edit Employee"
        fields={EMPLOYEE_FORM_FIELDS}
        initialData={employee as unknown as Record<string, string>}
        onSubmit={handleUpdate}
        submitLabel="Save"
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Employee"
        description={`Are you sure you want to delete "${employee.full_name}"? This will also remove the record from Lark Base. This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
