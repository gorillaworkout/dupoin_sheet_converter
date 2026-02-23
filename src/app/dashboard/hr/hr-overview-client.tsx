"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Search,
  UserPlus,
  LogIn,
  Users,
  LogOut,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { PipelineStats } from "@/types/hr";

interface HROverviewClientProps {
  stats: PipelineStats | null;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" as const },
  }),
};

const pipelineStages = [
  {
    key: "manpower" as const,
    label: "Manpower",
    sublabel: "Request",
    icon: ClipboardList,
    href: "/dashboard/manpower",
    gradient: "from-orange-500 to-amber-600",
    shadow: "shadow-orange-500/10",
    getStats: (s: PipelineStats) => ({
      total: s.manpower.total,
      detail: `${s.manpower.pending} pending`,
    }),
  },
  {
    key: "recruitment" as const,
    label: "Recruitment",
    sublabel: "Progress",
    icon: Search,
    href: "/dashboard/recruitment",
    gradient: "from-blue-500 to-indigo-600",
    shadow: "shadow-blue-500/10",
    getStats: (s: PipelineStats) => ({
      total: s.recruitment.total,
      detail: `${s.recruitment.in_progress} in progress`,
    }),
  },
  {
    key: "candidates" as const,
    label: "Candidates",
    sublabel: "Database",
    icon: UserPlus,
    href: "/dashboard/candidates",
    gradient: "from-purple-500 to-violet-600",
    shadow: "shadow-purple-500/10",
    getStats: (s: PipelineStats) => ({
      total: s.candidates.total,
      detail: `${s.candidates.shortlisted} shortlisted`,
    }),
  },
  {
    key: "onboarding" as const,
    label: "Onboarding",
    sublabel: "Checklist",
    icon: LogIn,
    href: "/dashboard/onboarding",
    gradient: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-500/10",
    getStats: (s: PipelineStats) => ({
      total: s.onboarding.total,
      detail: `${s.onboarding.in_progress} in progress`,
    }),
  },
  {
    key: "employees" as const,
    label: "Employee",
    sublabel: "Active",
    icon: Users,
    href: "/dashboard/employees",
    gradient: "from-cyan-500 to-blue-600",
    shadow: "shadow-cyan-500/10",
    getStats: (s: PipelineStats) => ({
      total: s.employees.total,
      detail: `${s.employees.active} active`,
    }),
  },
  {
    key: "offboarding" as const,
    label: "Offboarding",
    sublabel: "Exit",
    icon: LogOut,
    href: "/dashboard/offboarding",
    gradient: "from-rose-500 to-red-600",
    shadow: "shadow-rose-500/10",
    getStats: (s: PipelineStats) => ({
      total: s.offboarding.total,
      detail: `${s.offboarding.in_progress} in progress`,
    }),
  },
];

export function HROverviewClient({ stats }: HROverviewClientProps) {
  const defaultStats: PipelineStats = {
    manpower: { total: 0, pending: 0, approved: 0 },
    recruitment: { total: 0, in_progress: 0, completed: 0 },
    candidates: { total: 0, shortlisted: 0, offered: 0 },
    onboarding: { total: 0, in_progress: 0, completed: 0 },
    employees: { total: 0, active: 0 },
    offboarding: { total: 0, in_progress: 0, completed: 0 },
  };

  const data = stats || defaultStats;

  return (
    <div className="space-y-8">
      {/* Pipeline Flow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Pipeline Flow
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {pipelineStages.map((stage, i) => {
            const stageStats = stage.getStats(data);
            return (
              <div key={stage.key} className="flex items-center gap-2">
                <motion.div
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                >
                  <Link href={stage.href}>
                    <Card className="group border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all duration-200 hover:border-white/10 hover:bg-white/[0.04]">
                      <CardContent className="flex items-center gap-4 p-5">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stage.gradient} ${stage.shadow} shadow-lg`}
                        >
                          <stage.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                            {stage.label}
                          </span>
                          <span className="text-2xl font-bold tracking-tight text-white">
                            {stageStats.total}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {stageStats.detail}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
                {i < pipelineStages.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 + 0.2, duration: 0.3 }}
                  >
                    <ArrowRight className="h-5 w-5 text-zinc-600" />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Stats Summary Cards */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Ringkasan
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400">
                  Manpower Requests
                </h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Total</span>
                    <span className="text-sm font-semibold text-white">
                      {data.manpower.total}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Pending</span>
                    <span className="text-sm font-semibold text-amber-400">
                      {data.manpower.pending}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Approved</span>
                    <span className="text-sm font-semibold text-emerald-400">
                      {data.manpower.approved}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400">
                  Recruitment
                </h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Total</span>
                    <span className="text-sm font-semibold text-white">
                      {data.recruitment.total}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">In Progress</span>
                    <span className="text-sm font-semibold text-blue-400">
                      {data.recruitment.in_progress}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Completed</span>
                    <span className="text-sm font-semibold text-emerald-400">
                      {data.recruitment.completed}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-400">
                  Candidates
                </h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Total</span>
                    <span className="text-sm font-semibold text-white">
                      {data.candidates.total}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Shortlisted</span>
                    <span className="text-sm font-semibold text-blue-400">
                      {data.candidates.shortlisted}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Offered</span>
                    <span className="text-sm font-semibold text-emerald-400">
                      {data.candidates.offered}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
                  Onboarding
                </h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Total</span>
                    <span className="text-sm font-semibold text-white">
                      {data.onboarding.total}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">In Progress</span>
                    <span className="text-sm font-semibold text-amber-400">
                      {data.onboarding.in_progress}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Completed</span>
                    <span className="text-sm font-semibold text-emerald-400">
                      {data.onboarding.completed}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
                  Employees
                </h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Total</span>
                    <span className="text-sm font-semibold text-white">
                      {data.employees.total}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Active</span>
                    <span className="text-sm font-semibold text-emerald-400">
                      {data.employees.active}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            custom={5}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-rose-400">
                  Offboarding
                </h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Total</span>
                    <span className="text-sm font-semibold text-white">
                      {data.offboarding.total}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">In Progress</span>
                    <span className="text-sm font-semibold text-amber-400">
                      {data.offboarding.in_progress}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Completed</span>
                    <span className="text-sm font-semibold text-emerald-400">
                      {data.offboarding.completed}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
