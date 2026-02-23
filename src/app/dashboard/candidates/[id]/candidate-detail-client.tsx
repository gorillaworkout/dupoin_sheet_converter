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
import type { Candidate } from "@/types/hr";

interface Props {
  data: Candidate;
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
  if (n === "shortlisted")
    return <Badge className="border-blue-500/20 bg-blue-500/10 text-blue-400">{status}</Badge>;
  if (n === "offer sent" || n === "accepted")
    return <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400">{status}</Badge>;
  if (n === "rejected")
    return <Badge className="border-red-500/20 bg-red-500/10 text-red-400">{status}</Badge>;
  if (n === "pending" || n === "interview")
    return <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-400">{status}</Badge>;
  return <Badge className="border-zinc-500/20 bg-zinc-500/10 text-zinc-400">{status || "—"}</Badge>;
}

const editFields: FieldDefinition[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "position_applied", label: "Position Applied", type: "text", required: true },
  { name: "status", label: "Status", type: "select", options: ["Pending", "Shortlisted", "Interview", "Offer Sent", "Accepted", "Rejected"], required: true },
  { name: "interview_progress", label: "Progress Interview", type: "select", options: ["Screening", "HR Interview", "Technical Test", "User Interview", "Final Interview", "Completed"] },
  { name: "channel", label: "Channel", type: "text" },
  { name: "commencement_date", label: "Start Date", type: "date" },
  { name: "email", label: "Email", type: "text" },
  { name: "phone", label: "Phone", type: "text" },
  { name: "department", label: "Department", type: "text" },
  { name: "salary_expectation", label: "Salary Expectation", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export function CandidateDetailClient({ data }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const router = useRouter();

  const name = data.name || data.candidateName || "";
  const positionApplied = data.position_applied || data.positionApplied || "";
  const channel = data.channel || data.submissionChannel || "";
  const interviewProgress = data.interview_progress || data.interviewProgress || "";
  const commencementDate = data.commencement_date || data.commencementDate || "";
  const salaryExpectation = data.salary_expectation || data.salaryOffered || "";

  const handleEdit = async (formData: Record<string, string>) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    await fetch(`${baseUrl}/api/candidates/${data.record_id || data.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    router.refresh();
  };

  const handleDelete = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    await fetch(`${baseUrl}/api/candidates/${data.record_id || data.id}`, { method: "DELETE" });
    router.push("/dashboard/candidates");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/candidates">
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
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 text-xl font-bold text-white shadow-lg shadow-purple-500/20">
          {name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "?"}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{name || "Candidate"}</h1>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-sm text-zinc-400">{positionApplied}</span>
            <StatusBadge status={data.status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-cyan-400">Candidate Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <InfoField label="Name" value={name} />
              <InfoField label="Position Applied" value={positionApplied} />
              <InfoField label="Department" value={data.department} />
              <InfoField label="Channel" value={channel} />
              <InfoField label="Email" value={data.email} />
              <InfoField label="Phone" value={data.phone} />
            </dl>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-cyan-400">Status & Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-1">
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">Status</dt>
                <dd><StatusBadge status={data.status} /></dd>
              </div>
              <InfoField label="Interview Progress" value={interviewProgress} />
              <InfoField label="Start Date" value={commencementDate} />
              <InfoField label="Salary Expectation" value={salaryExpectation} />
            </dl>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-cyan-400">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <dl><InfoField label="Notes" value={data.notes} /></dl>
          </CardContent>
        </Card>
      </div>

      <FormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Edit Candidate"
        fields={editFields}
        initialData={data as unknown as Record<string, string>}
        onSubmit={handleEdit}
      />
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Candidate"
        description={`Are you sure you want to delete candidate "${name}"?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
