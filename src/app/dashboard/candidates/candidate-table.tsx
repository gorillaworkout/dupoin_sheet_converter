"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Filter, Plus, UserPlus, Users, Star } from "lucide-react";
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
import type { Candidate } from "@/types/hr";

interface CandidateTableProps {
  candidates: Candidate[];
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
  { name: "name", label: "Name", type: "text", required: true },
  { name: "position_applied", label: "Position Applied", type: "text", required: true },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: ["Pending", "Shortlisted", "Interview", "Offer Sent", "Accepted", "Rejected"],
    required: true,
  },
  {
    name: "interview_progress",
    label: "Progress Interview",
    type: "select",
    options: ["Screening", "HR Interview", "Technical Test", "User Interview", "Final Interview", "Completed"],
  },
  { name: "channel", label: "Channel", type: "text" },
  { name: "commencement_date", label: "Start Date", type: "date" },
  { name: "email", label: "Email", type: "text" },
  { name: "phone", label: "Phone", type: "text" },
  { name: "department", label: "Department", type: "text" },
  { name: "salary_expectation", label: "Salary Expectation", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

function StatusBadge({ status }: { status: string }) {
  const n = status?.toLowerCase().trim();
  if (n === "shortlisted")
    return <Badge className="border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">{status}</Badge>;
  if (n === "offer sent" || n === "accepted")
    return <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">{status}</Badge>;
  if (n === "rejected")
    return <Badge className="border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20">{status}</Badge>;
  if (n === "pending" || n === "interview")
    return <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20">{status}</Badge>;
  return <Badge className="border-zinc-500/20 bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20">{status || "—"}</Badge>;
}

export function CandidateTable({ candidates }: CandidateTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [progressFilter, setProgressFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const router = useRouter();

  const statuses = useMemo(() => {
    const set = new Set(candidates.map((c) => c.status).filter(Boolean));
    return Array.from(set).sort();
  }, [candidates]);

  const progressStages = useMemo(() => {
    const set = new Set(candidates.map((c) => c.interview_progress || c.interviewProgress).filter(Boolean));
    return Array.from(set).sort();
  }, [candidates]);

  const getName = (c: Candidate) => c.name || c.candidateName || "";
  const getPosition = (c: Candidate) => c.position_applied || c.positionApplied || "";
  const getChannel = (c: Candidate) => c.channel || c.submissionChannel || "";
  const getProgress = (c: Candidate) => c.interview_progress || c.interviewProgress || "";
  const getDate = (c: Candidate) => c.commencement_date || c.commencementDate || "";

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        getName(c).toLowerCase().includes(q) ||
        getPosition(c).toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        getChannel(c).toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      const matchesProgress = progressFilter === "all" || getProgress(c) === progressFilter;
      return matchesSearch && matchesStatus && matchesProgress;
    });
  }, [candidates, search, statusFilter, progressFilter]);

  const shortlistedCount = candidates.filter((c) => c.status?.toLowerCase() === "shortlisted").length;
  const offeredCount = candidates.filter(
    (c) => ["offer sent", "accepted"].includes(c.status?.toLowerCase())
  ).length;

  const handleCreate = async (data: Record<string, string>) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    await fetch(`${baseUrl}/api/candidates`, {
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
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg shadow-purple-500/10">
                <UserPlus className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Total Candidates</span>
                <span className="text-2xl font-bold tracking-tight text-white">{candidates.length}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants}>
          <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/10">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Shortlisted</span>
                <span className="text-2xl font-bold tracking-tight text-white">{shortlistedCount}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants}>
          <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/10">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Offered</span>
                <span className="text-2xl font-bold tracking-tight text-white">{offeredCount}</span>
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
            placeholder="Search name, position, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 rounded-lg border-white/10 bg-white/5 pl-9 text-sm text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
          <Select value={progressFilter} onValueChange={setProgressFilter}>
            <SelectTrigger className="h-9 w-[160px] border-white/10 bg-white/5 text-sm text-zinc-300">
              <SelectValue placeholder="Progress" />
            </SelectTrigger>
            <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-200">
              <SelectItem value="all" className="text-zinc-200 focus:bg-zinc-800 focus:text-white">All Progress</SelectItem>
              {progressStages.map((s) => (
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
        Showing {filtered.length} of {candidates.length} candidates
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
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Name</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Position</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Interview</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Channel</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Start Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-sm text-zinc-500">
                  {search || statusFilter !== "all" || progressFilter !== "all"
                    ? "No candidates match the filter."
                    : "No candidate data."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow key={c.record_id || c.id} className="border-white/5 transition-colors hover:bg-white/[0.03]">
                  <TableCell>
                    <Link
                      href={`/dashboard/candidates/${c.record_id || c.id}`}
                      className="font-medium text-white hover:text-cyan-400 transition-colors"
                    >
                      {getName(c) || "—"}
                    </Link>
                  </TableCell>
                  <TableCell className="text-zinc-300">{getPosition(c) || "—"}</TableCell>
                  <TableCell><StatusBadge status={c.status} /></TableCell>
                  <TableCell className="text-zinc-300">{getProgress(c) || "—"}</TableCell>
                  <TableCell className="text-zinc-400">{getChannel(c) || "—"}</TableCell>
                  <TableCell className="text-zinc-400">{getDate(c) || "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title="Add Candidate"
        fields={formFields}
        onSubmit={handleCreate}
        submitLabel="Add"
      />
    </div>
  );
}
