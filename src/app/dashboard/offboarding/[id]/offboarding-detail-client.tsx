"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormDialog, type FieldDefinition } from "@/components/dashboard/form-dialog";
import { DeleteDialog } from "@/components/dashboard/delete-dialog";
import type { OffboardingRecord } from "@/types/hr";

interface Props {
  data: OffboardingRecord;
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</dt>
      <dd className="text-sm text-zinc-200">{value || "—"}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const n = status?.toLowerCase().trim();
  if (n === "completed" || n === "yes" || n === "done")
    return <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400">{status}</Badge>;
  if (n === "in progress" || n === "pending")
    return <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-400">{status}</Badge>;
  return <Badge className="border-zinc-500/20 bg-zinc-500/10 text-zinc-400">{status || "—"}</Badge>;
}

const editFields: FieldDefinition[] = [
  { name: "fullName", label: "Nama Lengkap", type: "text", required: true },
  { name: "company", label: "Company", type: "text" },
  { name: "lastWorkingDay", label: "Last Working Day", type: "date" },
  { name: "offboardReason", label: "Alasan Offboard", type: "textarea" },
  { name: "offboarded", label: "Status Offboarded", type: "select", options: ["Yes", "No", "In Progress"] },
];

export function OffboardingDetailClient({ data }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const router = useRouter();

  const handleEdit = async (formData: Record<string, string>) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    await fetch(`${baseUrl}/api/offboarding/${data.record_id || data.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    router.refresh();
  };

  const handleDelete = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    await fetch(`${baseUrl}/api/offboarding/${data.record_id || data.id}`, { method: "DELETE" });
    router.push("/dashboard/offboarding");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/offboarding">
          <Button variant="ghost" size="sm" className="gap-2 text-zinc-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)} className="gap-2 text-zinc-400 hover:text-white">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)} className="gap-2 text-red-400 hover:text-red-300">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-xl font-bold text-white shadow-lg shadow-rose-500/20">
          OB
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {data.fullName || "Offboarding"}
          </h1>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-sm text-zinc-400">{data.company}</span>
            <StatusBadge status={data.offboarded} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-cyan-400">Informasi Offboarding</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <InfoField label="Nama" value={data.fullName} />
              <InfoField label="Company" value={data.company} />
              <InfoField label="Last Working Day" value={data.lastWorkingDay} />
              <InfoField label="Alasan" value={data.offboardReason} />
            </dl>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-cyan-400">Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <InfoField label="Exit Interview" value={data.exitInterview} />
              <InfoField label="Handover Form" value={data.handoverForm} />
              <InfoField label="HR Confirmation" value={data.hrConfirmation} />
              <InfoField label="Admin Confirmation" value={data.adminConfirmation} />
              <InfoField label="Finance Confirmation" value={data.financeConfirmation} />
              <InfoField label="Manager Confirmation" value={data.managerConfirmation} />
              <InfoField label="Lark Account" value={data.larkAccount} />
              <InfoField label="Access Assignment" value={data.accessAssignment} />
              <InfoField label="Asset Assignment" value={data.assetAssignment} />
              <div className="space-y-1">
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">Offboarded</dt>
                <dd><StatusBadge status={data.offboarded} /></dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <FormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Edit Offboarding"
        fields={editFields}
        initialData={data as unknown as Record<string, string>}
        onSubmit={handleEdit}
      />
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Offboarding"
        description={`Apakah Anda yakin ingin menghapus offboarding "${data.fullName}"?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
