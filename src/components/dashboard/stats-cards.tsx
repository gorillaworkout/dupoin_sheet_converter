"use client";

import { motion, type Variants, type Easing } from "framer-motion";
import { FileSpreadsheet, Upload, CloudUpload, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  totalSheets: number;
  recentlyModified: number;
}

const ease: Easing = "easeOut";

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease },
  }),
};

export function StatsCards({ totalSheets, recentlyModified }: StatsCardsProps) {
  const stats = [
    {
      title: "Total Spreadsheet",
      value: totalSheets,
      icon: FileSpreadsheet,
      gradient: "from-cyan-500 to-blue-600",
      shadowColor: "shadow-cyan-500/10",
    },
    {
      title: "Upload Minggu Ini",
      value: recentlyModified,
      icon: Upload,
      gradient: "from-emerald-500 to-teal-600",
      shadowColor: "shadow-emerald-500/10",
    },
    {
      title: "Diupload ke GSheet",
      value: totalSheets,
      icon: CloudUpload,
      gradient: "from-violet-500 to-purple-600",
      shadowColor: "shadow-violet-500/10",
    },
    {
      title: "Terakhir Diakses",
      value: "Baru saja",
      icon: Clock,
      gradient: "from-amber-500 to-orange-600",
      shadowColor: "shadow-amber-500/10",
      isText: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.title}
          custom={i}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Card className="group relative overflow-hidden border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04]">
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.shadowColor}`}
              >
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {stat.title}
                </span>
                <span className="text-2xl font-bold tracking-tight text-white">
                  {stat.value}
                </span>
              </div>
            </CardContent>
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
