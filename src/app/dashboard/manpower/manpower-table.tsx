"use client";

import { useState, useMemo } from "react";
import { Search, FileText, CheckCircle, Clock, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import type { ManpowerRequest } from "@/types/hr";

interface ManpowerTableProps {
  requests: ManpowerRequest[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" as const },
  }),
};

function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toLowerCase().trim();

  if (normalized === "approved") {
    return (
      <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">
        Approved
      </Badge>
    );
  }

  if (normalized === "pending") {
    return (
      <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20">
        Pending
      </Badge>
    );
  }

  if (normalized === "rejected") {
    return (
      <Badge className="border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20">
        Rejected
      </Badge>
    );
  }

  return (
    <Badge className="border-zinc-500/20 bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20">
      {status || "—"}
    </Badge>
  );
}

export function ManpowerTable({ requests }: ManpowerTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const statuses = useMemo(() => {
    const set = new Set(requests.map((r) => r.status).filter(Boolean));
    return Array.from(set).sort();
  }, [requests]);

  const filtered = useMemo(() => {
    return requests.filter((req) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        req.requestNo?.toLowerCase().includes(q) ||
        req.candidateName?.toLowerCase().includes(q) ||
        req.department?.toLowerCase().includes(q) ||
        req.position?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" || req.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const approvedCount = requests.filter(
    (r) => r.status?.toLowerCase() === "approved"
  ).length;

  const pendingCount = requests.filter(
    (r) => r.status?.toLowerCase() === "pending"
  ).length;

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants}>
          <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/10">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Total Requests
                </span>
                <span className="text-2xl font-bold tracking-tight text-white">
                  {requests.length}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants}>
          <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/10">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Approved
                </span>
                <span className="text-2xl font-bold tracking-tight text-white">
                  {approvedCount}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants}>
          <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/10">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Pending
                </span>
                <span className="text-2xl font-bold tracking-tight text-white">
                  {pendingCount}
                </span>
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
            placeholder="Search request no, name, department, position..."
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
                <SelectItem key={s} value={s} className="text-zinc-200 focus:bg-zinc-800 focus:text-white">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Results count */}
      <div className="text-xs text-zinc-500">
        Showing {filtered.length} of {requests.length} requests
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
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Request No
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Department
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Position
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Employment Type
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Submitted
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-sm text-zinc-500"
                >
                  {search || statusFilter !== "all"
                    ? "No requests match the current filter."
                    : "No manpower requests found."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((req) => (
                <TableRow
                  key={req.record_id}
                  className="border-white/5 transition-colors hover:bg-white/[0.03]"
                >
                  <TableCell className="font-medium text-white">
                    {req.requestNo || "—"}
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {req.department || "—"}
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {req.position || "—"}
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {req.employmentType || "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={req.status} />
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    {req.submittedAt || "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
