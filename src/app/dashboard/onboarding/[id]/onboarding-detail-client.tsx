"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, CheckCircle2, Circle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormDialog, type FieldDefinition } from "@/components/dashboard/form-dialog";
import { DeleteDialog } from "@/components/dashboard/delete-dialog";
import type { OnboardingRecord } from "@/types/hr";

interface Props {
  data: OnboardingRecord;
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
  if (["completed", "yes", "done"].includes(n))
    return <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400">{status}</Badge>;
  if (["in progress", "pending"].includes(n))
    return <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-400">{status}</Badge>;
  return <Badge className="border-zinc-500/20 bg-zinc-500/10 text-zinc-400">{status || "—"}</Badge>;
}

function isDone(val: string | undefined | boolean): boolean {
  if (!val) return false;
  if (typeof val === "boolean") return val;
  const n = String(val).toLowerCase().trim();
  return ["yes", "done", "completed", "true", "✓", "✔"].includes(n);
}

const checklistItems = [
  { key: "offerLetter", label: "Offer Letter", description: "Surat penawaran kerja telah dikirim dan ditandatangani" },
  { key: "preEmployment", label: "Pre-employment Check", description: "Pemeriksaan latar belakang dan dokumen pra-kerja" },
  { key: "rankChart", label: "Rank Chart", description: "Penempatan dalam rank chart" },
  { key: "orgChart", label: "Org Chart", description: "Penempatan dalam struktur organisasi" },
  { key: "pFile", label: "P-File", description: "Personnel file telah dibuat" },
  { key: "hrConfirmation", label: "HR Confirmation", description: "Confirmed by HR" },
  { key: "larkAccount", label: "Lark Account", description: "Akun Lark telah dibuat" },
  { key: "emailCreation", label: "Email Creation", description: "Email perusahaan telah dibuat" },
  { key: "accessAssignment", label: "Access Assignment", description: "Akses sistem telah diberikan" },
  { key: "assetAssignment", label: "Asset Assignment", description: "Laptop dan aset telah disiapkan" },
  { key: "adminConfirmation", label: "Admin Confirmation", description: "Confirmed by admin" },
  { key: "managerConfirmation", label: "Manager Confirmation", description: "Confirmed by manager" },
  { key: "probationPass", label: "Probation Pass", description: "Review probation telah ditetapkan" },
] as const;

const editFields: FieldDefinition[] = [
  { name: "fullName", label: "Nama", type: "text", required: true },
  { name: "position", label: "Posisi", type: "text", required: true },
  { name: "department", label: "Departemen", type: "text", required: true },
  { name: "commencementDate", label: "Tanggal Mulai", type: "date", required: true },
  { name: "incomingStatus", label: "Status", type: "select", options: ["New Hire", "Transfer", "Rehire"], required: true },
];

export function OnboardingDetailClient({ data }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const router = useRouter();

  const completedCount = checklistItems.filter(
    (item) => isDone(data[item.key])
  ).length;

  const handleEdit = async (formData: Record<string, string>) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    await fetch(`${baseUrl}/api/onboarding/${data.record_id || data.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    router.refresh();
  };

  const handleDelete = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    await fetch(`${baseUrl}/api/onboarding/${data.record_id || data.id}`, { method: "DELETE" });
    router.push("/dashboard/onboarding");
  };

  const handleToggleChecklist = async (key: string, currentDone: boolean) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    await fetch(`${baseUrl}/api/onboarding/${data.record_id || data.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: currentDone ? "No" : "Yes" }),
    });
    router.refresh();
  };

  const pct = (completedCount / checklistItems.length) * 100;
  const name = data.fullName || "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/onboarding">
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
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-xl font-bold text-white shadow-lg shadow-emerald-500/20">
          {name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "?"}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{name || "Onboarding"}</h1>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-sm text-zinc-400">{data.position}</span>
            <StatusBadge status={data.completed || data.incomingStatus} />
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-300">Checklist Progress</span>
            <span className="text-sm font-semibold text-white">{completedCount}/{checklistItems.length}</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Info Card */}
        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-cyan-400">Informasi</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <InfoField label="Nama" value={name} />
              <InfoField label="Posisi" value={data.position} />
              <InfoField label="Departemen" value={data.department} />
              <InfoField label="Status" value={data.incomingStatus} />
              <InfoField label="Tanggal Mulai" value={data.commencementDate} />
              <div className="space-y-1">
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">Completed</dt>
                <dd><StatusBadge status={data.completed} /></dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Checklist Card */}
        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-cyan-400">Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checklistItems.map((item, i) => {
                const isChecked = isDone(data[item.key]);
                return (
                  <motion.button
                    key={item.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    onClick={() => handleToggleChecklist(item.key, isChecked)}
                    className="flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors hover:bg-white/5"
                  >
                    {isChecked ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                    ) : (
                      <Circle className="mt-0.5 h-5 w-5 shrink-0 text-zinc-600" />
                    )}
                    <div>
                      <span className={`text-sm font-medium ${isChecked ? "text-zinc-300 line-through" : "text-white"}`}>
                        {item.label}
                      </span>
                      <p className="text-xs text-zinc-500">{item.description}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <FormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Edit Onboarding"
        fields={editFields}
        initialData={data as unknown as Record<string, string>}
        onSubmit={handleEdit}
      />
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Onboarding"
        description={`Apakah Anda yakin ingin menghapus onboarding "${name}"?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
