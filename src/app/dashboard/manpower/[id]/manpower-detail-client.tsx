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
import type { ManpowerRequest } from "@/types/hr";

interface ManpowerDetailClientProps {
  data: ManpowerRequest;
}

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
  if (normalized === "approved") {
    return (
      <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
        Approved
      </Badge>
    );
  }
  if (normalized === "pending") {
    return (
      <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-400">
        Pending
      </Badge>
    );
  }
  if (normalized === "rejected") {
    return (
      <Badge className="border-red-500/20 bg-red-500/10 text-red-400">
        Rejected
      </Badge>
    );
  }
  return (
    <Badge className="border-zinc-500/20 bg-zinc-500/10 text-zinc-400">
      {status || "—"}
    </Badge>
  );
}

const editFields: FieldDefinition[] = [
  { name: "request_no", label: "No. Request", type: "text", required: true },
  { name: "position", label: "Posisi", type: "text", required: true },
  { name: "department", label: "Departemen", type: "text", required: true },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: ["Pending", "Approved", "Rejected"],
    required: true,
  },
  { name: "requester", label: "Requester", type: "text", required: true },
  { name: "required_start_date", label: "Tanggal Mulai", type: "date" },
  { name: "number_of_positions", label: "Jumlah Posisi", type: "number" },
  {
    name: "employment_type",
    label: "Tipe Pekerjaan",
    type: "select",
    options: ["Full-time", "Part-time", "Contract", "Internship"],
  },
  { name: "company", label: "Company", type: "text" },
  { name: "budget", label: "Budget", type: "text" },
  { name: "justification", label: "Justifikasi", type: "textarea" },
  { name: "notes", label: "Catatan", type: "textarea" },
];

export function ManpowerDetailClient({ data }: ManpowerDetailClientProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const router = useRouter();

  const handleEdit = async (formData: Record<string, string>) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    await fetch(`${baseUrl}/api/manpower/${data.record_id || data.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    router.refresh();
  };

  const handleDelete = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    await fetch(`${baseUrl}/api/manpower/${data.record_id || data.id}`, {
      method: "DELETE",
    });
    router.push("/dashboard/manpower");
  };

  return (
    <div className="space-y-6">
      {/* Back button & actions */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/manpower">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditOpen(true)}
            className="gap-2 text-zinc-400 hover:text-white"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="gap-2 text-red-400 hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-xl font-bold text-white shadow-lg shadow-orange-500/20">
          MP
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {data.request_no || "Manpower Request"}
          </h1>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-sm text-zinc-400">{data.position}</span>
            <StatusBadge status={data.status} />
          </div>
        </div>
      </div>

      {/* Detail cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
              Informasi Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <InfoField label="No. Request" value={data.request_no} />
              <InfoField label="Posisi" value={data.position} />
              <InfoField label="Departemen" value={data.department} />
              <InfoField label="Requester" value={data.requester} />
              <InfoField label="Tanggal Mulai" value={data.required_start_date} />
              <InfoField label="Jumlah Posisi" value={data.number_of_positions} />
            </dl>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
              Additional Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <InfoField label="Tipe Pekerjaan" value={data.employment_type} />
              <InfoField label="Company" value={data.company} />
              <InfoField label="Budget" value={data.budget} />
              <div className="space-y-1">
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Status
                </dt>
                <dd>
                  <StatusBadge status={data.status} />
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
              Justifikasi & Catatan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <InfoField label="Justifikasi" value={data.justification} />
              <InfoField label="Catatan" value={data.notes} />
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <FormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Edit Manpower Request"
        fields={editFields}
        initialData={data as unknown as Record<string, string>}
        onSubmit={handleEdit}
        submitLabel="Save"
      />

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Manpower Request"
        description={`Apakah Anda yakin ingin menghapus request "${data.request_no}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
