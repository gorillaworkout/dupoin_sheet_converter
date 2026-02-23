"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Filter, Plus, LogOut, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormDialog, type FieldDefinition } from "@/components/dashboard/form-dialog";
import type { OffboardingRecord } from "@/types/hr";

interface OffboardingTableProps {
  records: OffboardingRecord[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" as const },
  }),
};

function isDone(val: string | undefined | boolean): boolean {
  if (!val) return false;
  if (typeof val === "boolean") return val;
  const n = String(val).toLowerCase().trim();
  return ["yes", "done", "completed", "true", "✓", "✔"].includes(n);
}

// Checklist keys from the Lark schema
const checklistKeys = [
  "rankChart",
  "orgChart",
  "pFile",
  "exitInterview",
  "handoverForm",
  "hrConfirmation",
  "accessAssignment",
  "assetAssignment",
  "larkAccount",
  "adminConfirmation",
  "financeConfirmation",
  "managerConfirmation",
] as const;

function getChecklistProgress(record: OffboardingRecord) {
  let completed = 0;
  for (const key of checklistKeys) {
    if (isDone(record[key])) completed++;
  }
  return { completed, total: checklistKeys.length };
}

const formFields: FieldDefinition[] = [
  { name: "fullName", label: "Nama", type: "text", required: true },
  { name: "company", label: "Company", type: "text", required: true },
  { name: "lastWorkingDay", label: "Hari Kerja Terakhir", type: "date", required: true },
  {
    name: "offboardReason",
    label: "Alasan",
    type: "select",
    options: ["Resign", "Terminated", "Contract End", "Retirement", "Other"],
    required: true,
  },
];

function StatusBadge({ status }: { status: string }) {
  const n = status?.toLowerCase().trim();
  if (["completed", "yes", "done"].includes(n))
    return <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">{status}</Badge>;
  if (["in progress", "pending"].includes(n))
    return <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20">{status}</Badge>;
  return <Badge className="border-zinc-500/20 bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20">{status || "—"}</Badge>;
}

function ReasonBadge({ reason }: { reason: string }) {
  const n = reason?.toLowerCase().trim();
  if (n === "resign")
    return <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20">{reason}</Badge>;
  if (n === "terminated")
    return <Badge className="border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20">{reason}</Badge>;
  if (n === "contract end")
    return <Badge className="border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">{reason}</Badge>;
  if (n === "retirement")
    return <Badge className="border-purple-500/20 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20">{reason}</Badge>;
  return <Badge className="border-zinc-500/20 bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20">{reason || "—"}</Badge>;
}

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? (completed / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-rose-500 to-red-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-zinc-400">
        {completed}/{total}
      </span>
    </div>
  );
}

export function OffboardingTable({ records }: OffboardingTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const router = useRouter();

  const filtered = useMemo(() => {
    return records.filter((rec) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        rec.fullName?.toLowerCase().includes(q) ||
        rec.company?.toLowerCase().includes(q) ||
        rec.offboardReason?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "completed" && isDone(rec.offboarded)) ||
        (statusFilter === "in_progress" && !isDone(rec.offboarded));

      return matchesSearch && matchesStatus;
    });
  }, [records, search, statusFilter]);

  const completedCount = records.filter((r) => isDone(r.offboarded)).length;
  const inProgressCount = records.length - completedCount;

  const handleCreate = async (data: Record<string, string>) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    await fetch(`${baseUrl}/api/offboarding`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants}>
          <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/10">
                <LogOut className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Total</span>
                <span className="text-2xl font-bold tracking-tight text-white">{records.length}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants}>
          <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/10">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">In Progress</span>
                <span className="text-2xl font-bold tracking-tight text-white">{inProgressCount}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants}>
          <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Completed</span>
                <span className="text-2xl font-bold tracking-tight text-white">{completedCount}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search name, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 rounded-lg border-white/10 bg-white/5 pl-9 text-sm text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-500" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[140px] border-white/10 bg-white/5 text-sm text-zinc-300">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-200">
              <SelectItem value="all" className="text-zinc-200 focus:bg-zinc-800 focus:text-white">All</SelectItem>
              <SelectItem value="in_progress" className="text-zinc-200 focus:bg-zinc-800 focus:text-white">In Progress</SelectItem>
              <SelectItem value="completed" className="text-zinc-200 focus:bg-zinc-800 focus:text-white">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => setFormOpen(true)}
            className="h-9 gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </motion.div>

      <div className="text-xs text-zinc-500">
        Menampilkan {filtered.length} dari {records.length} offboarding
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm"
      >
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Nama</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Company</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Hari Terakhir</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Alasan</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-sm text-zinc-500">
                  {search || statusFilter !== "all"
                    ? "No offboarding records match the filter."
                    : "No offboarding records found."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((rec) => {
                const progress = getChecklistProgress(rec);
                return (
                  <TableRow key={rec.record_id || rec.id} className="border-white/5 transition-colors hover:bg-white/[0.03]">
                    <TableCell>
                      <Link
                        href={`/dashboard/offboarding/${rec.record_id || rec.id}`}
                        className="font-medium text-white hover:text-cyan-400 transition-colors"
                      >
                        {rec.fullName || "—"}
                      </Link>
                    </TableCell>
                    <TableCell className="text-zinc-300">{rec.company || "—"}</TableCell>
                    <TableCell className="text-zinc-400">{rec.lastWorkingDay || "—"}</TableCell>
                    <TableCell><ReasonBadge reason={rec.offboardReason} /></TableCell>
                    <TableCell><StatusBadge status={rec.offboarded || ""} /></TableCell>
                    <TableCell>
                      <ProgressBar completed={progress.completed} total={progress.total} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </motion.div>

      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title="Add Offboarding"
        fields={formFields}
        onSubmit={handleCreate}
        submitLabel="Add"
      />
    </div>
  );
}
