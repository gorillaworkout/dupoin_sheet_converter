"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Users, UserCheck, Building2, Filter, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { FormDialog, type FieldDefinition } from "@/components/dashboard/form-dialog";
import { EMPLOYEE_FORM_FIELDS } from "@/lib/employee-form-fields";
import type { Employee } from "@/types/employee";

interface EmployeeTableProps {
  employees: Employee[];
}


function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toLowerCase().trim();
  if (normalized === "active") {
    return <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400">Active</Badge>;
  }
  if (normalized === "inactive" || normalized === "terminated") {
    return <Badge className="border-red-500/20 bg-red-500/10 text-red-400">{status}</Badge>;
  }
  if (normalized === "on leave" || normalized === "probation") {
    return <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-400">{status}</Badge>;
  }
  return <Badge className="border-zinc-500/20 bg-zinc-500/10 text-zinc-400">{status || "—"}</Badge>;
}

export function EmployeeTable({ employees: initialEmployees }: EmployeeTableProps) {
  const router = useRouter();
  const [employees, setEmployees] = useState(initialEmployees);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);

  const statuses = useMemo(() => {
    const set = new Set(employees.map((e) => e.status).filter(Boolean));
    return Array.from(set).sort();
  }, [employees]);

  const companies = useMemo(() => {
    const set = new Set(employees.map((e) => e.company).filter(Boolean));
    return Array.from(set).sort();
  }, [employees]);

  const filtered = useMemo(() => {
    return employees.filter((emp) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        emp.full_name?.toLowerCase().includes(q) ||
        emp.nickname?.toLowerCase().includes(q) ||
        emp.work_email?.toLowerCase().includes(q) ||
        emp.business_email?.toLowerCase().includes(q) ||
        emp.job_title?.toLowerCase().includes(q) ||
        emp.primary_department?.toLowerCase().includes(q) ||
        emp.company?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || emp.status === statusFilter;
      const matchesCompany = companyFilter === "all" || emp.company === companyFilter;
      return matchesSearch && matchesStatus && matchesCompany;
    });
  }, [employees, search, statusFilter, companyFilter]);

  const activeCount = employees.filter((e) => e.status?.toLowerCase() === "active").length;
  const uniqueCompanies = new Set(employees.map((e) => e.company).filter(Boolean));

  async function handleAdd(data: Record<string, string>) {
    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to add employee");
    const result = await res.json();
    // Add to local state immediately — no page refresh needed
    const newEmployee = {
      record_id: result.record_id,
      ...data,
    } as unknown as Employee;
    setEmployees((prev) => [newEmployee, ...prev]);
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/10">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Total</span>
              <span className="text-2xl font-bold tracking-tight text-white">{employees.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/10">
              <UserCheck className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Active</span>
              <span className="text-2xl font-bold tracking-tight text-white">{activeCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/10">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Companies</span>
              <span className="text-2xl font-bold tracking-tight text-white">{uniqueCompanies.size}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search, Filter & Add */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search name, email, job title, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 rounded-lg border-white/10 bg-white/5 pl-9 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
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

          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger className="h-9 w-[160px] border-white/10 bg-white/5 text-sm text-zinc-300">
              <SelectValue placeholder="Company" />
            </SelectTrigger>
            <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-200">
              <SelectItem value="all" className="text-zinc-200 focus:bg-zinc-800 focus:text-white">All Companies</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c} value={c} className="text-zinc-200 focus:bg-zinc-800 focus:text-white">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            size="sm"
            className="gap-2 bg-cyan-600 text-white hover:bg-cyan-700"
            onClick={() => setShowAdd(true)}
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      {/* Count */}
      <div className="text-xs text-zinc-500">
        Showing {filtered.length} of {employees.length} employees
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Name</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Company</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Job Title</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Department</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Date Joined</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-sm text-zinc-500">
                  {search || statusFilter !== "all" || companyFilter !== "all"
                    ? "No employees match the filter."
                    : "No employee data."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((emp) => (
                <TableRow key={emp.record_id} className="border-white/5 transition-colors hover:bg-white/[0.03]">
                  <TableCell>
                    <Link href={`/dashboard/employees/${emp.record_id}`} className="group flex flex-col">
                      <span className="font-medium text-white group-hover:text-cyan-400 transition-colors">
                        {emp.full_name || "—"}
                      </span>
                      {emp.nickname && <span className="text-xs text-zinc-500">{emp.nickname}</span>}
                    </Link>
                  </TableCell>
                  <TableCell className="text-zinc-300">{emp.company || "—"}</TableCell>
                  <TableCell className="text-zinc-300">{emp.job_title || "—"}</TableCell>
                  <TableCell className="text-zinc-300">{emp.primary_department || "—"}</TableCell>
                  <TableCell><StatusBadge status={emp.status} /></TableCell>
                  <TableCell className="text-zinc-400">{emp.date_of_joining || "—"}</TableCell>
                  <TableCell className="text-zinc-400 text-xs">{emp.work_email || emp.business_email || "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Dialog */}
      <FormDialog
        open={showAdd}
        onOpenChange={setShowAdd}
        title="Add Employee"
        fields={EMPLOYEE_FORM_FIELDS}
        onSubmit={handleAdd}
        submitLabel="Add"
      />
    </div>
  );
}
