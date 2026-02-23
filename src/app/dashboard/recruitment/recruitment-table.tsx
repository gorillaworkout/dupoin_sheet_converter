"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Filter, Plus, Users, Clock, CheckCircle2 } from "lucide-react";
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
import type { RecruitmentProgress } from "@/types/hr";

interface RecruitmentTableProps {
  records: RecruitmentProgress[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" as const },
  }),
};

const formFields: FieldDefinition[] = [
  { name: "position", label: "Position", type: "text", required: true },
  { name: "candidate_name", label: "Candidate Name", type: "text", required: true },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: ["Open", "In Progress", "Interview", "Offer", "Completed", "Cancelled"],
    required: true,
  },
  { name: "hiring_manager", label: "Hiring Manager", type: "text" },
  { name: "start_date", label: "Start Date", type: "date" },
  { name: "department", label: "Department", type: "text" },
  {
    name: "interview_stage",
    label: "Interview Stage",
    type: "select",
    options: ["Screening", "HR Interview", "Technical", "Final", "Completed"],
  },
  { name: "source_channel", label: "Channel", type: "text" },
  { name: "salary_offered", label: "Salary Offered", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toLowerCase().trim();
  if (normalized === "completed" || normalized === "offer") {
    return (
      <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">
        {status}
      </Badge>
    );
  }
  if (normalized === "in progress" || normalized === "interview") {
    return (
      <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20">
        {status}
      </Badge>
    );
  }
  if (normalized === "cancelled") {
    return (
      <Badge className="border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20">
        {status}
      </Badge>
    );
  }
  if (normalized === "open") {
    return (
      <Badge className="border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">
        {status}
      </Badge>
    );
  }
  return (
    <Badge className="border-zinc-500/20 bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20">
      {status || "—"}
    </Badge>
  );
}

export function RecruitmentTable({ records }: RecruitmentTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const router = useRouter();

  const statuses = useMemo(() => {
    const set = new Set(records.map((r) => r.status).filter(Boolean));
    return Array.from(set).sort();
  }, [records]);

  const filtered = useMemo(() => {
    return records.filter((rec) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        rec.position?.toLowerCase().includes(q) ||
        rec.candidate_name?.toLowerCase().includes(q) ||
        rec.hiring_manager?.toLowerCase().includes(q) ||
        rec.department?.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || rec.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [records, search, statusFilter]);

  const inProgressCount = records.filter(
    (r) => ["in progress", "interview"].includes(r.status?.toLowerCase())
  ).length;
  const completedCount = records.filter(
    (r) => r.status?.toLowerCase() === "completed"
  ).length;

  const handleCreate = async (data: Record<string, string>) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    await fetch(`${baseUrl}/api/recruitment`, {
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
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/10">
                <Users className="h-5 w-5 text-white" />
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
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/10">
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
            placeholder="Search position, candidate, hiring manager..."
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
              <SelectItem value="all" className="text-zinc-200 focus:bg-zinc-800 focus:text-white">All Status</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s} className="text-zinc-200 focus:bg-zinc-800 focus:text-white">{s}</SelectItem>
              ))}
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
        Showing {filtered.length} of {records.length} recruitments
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
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">ID</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Position</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Candidate</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Hiring Manager</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Start Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-sm text-zinc-500">
                  {search || statusFilter !== "all"
                    ? "No recruitments match the filter."
                    : "No recruitment data."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((rec) => (
                <TableRow key={rec.record_id || rec.id} className="border-white/5 transition-colors hover:bg-white/[0.03]">
                  <TableCell>
                    <Link
                      href={`/dashboard/recruitment/${rec.record_id || rec.id}`}
                      className="font-medium text-white hover:text-cyan-400 transition-colors"
                    >
                      {rec.id || rec.record_id || "—"}
                    </Link>
                  </TableCell>
                  <TableCell className="text-zinc-300">{rec.position || "—"}</TableCell>
                  <TableCell className="text-zinc-300">{rec.candidate_name || "—"}</TableCell>
                  <TableCell><StatusBadge status={rec.status} /></TableCell>
                  <TableCell className="text-zinc-300">{rec.hiring_manager || "—"}</TableCell>
                  <TableCell className="text-zinc-400">{rec.start_date || "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title="Add Recruitment"
        fields={formFields}
        onSubmit={handleCreate}
        submitLabel="Add"
      />
    </div>
  );
}
