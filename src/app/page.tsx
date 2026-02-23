import Link from "next/link";
import { ArrowRight, Upload, Zap, CloudUpload, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-zinc-950 to-zinc-950" />

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-72 w-72 rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5">
          <Zap className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-xs font-medium text-cyan-400">
            Google Sheets Manager
          </span>
        </div>

        <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
          <span className="bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
            Dupoin
          </span>
          <br />
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Dashboard
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-zinc-400">
          Upload Excel/CSV files, edit directly in browser, and save to Google
          Sheets. All from one dashboard.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 px-8 text-white shadow-xl shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500"
          >
            <Link href="/dashboard">
              Enter Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              icon: Upload,
              title: "Upload File",
              desc: "Upload .xlsx, .xls, or .csv files and instantly view the contents",
              gradient: "from-cyan-500 to-blue-600",
            },
            {
              icon: Pencil,
              title: "Edit Inline",
              desc: "Edit spreadsheet data directly from the dashboard before uploading",
              gradient: "from-emerald-500 to-teal-600",
            },
            {
              icon: CloudUpload,
              title: "Save to GSheet",
              desc: "Upload to Google Sheets and sync changes anytime",
              gradient: "from-violet-500 to-purple-600",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-left backdrop-blur-sm transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04]"
            >
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}
              >
                <feature.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mb-2 text-sm font-semibold text-white">
                {feature.title}
              </h3>
              <p className="text-xs leading-relaxed text-zinc-500">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <footer className="relative z-10 mt-20 pb-8 text-center text-xs text-zinc-600">
        &copy; {new Date().getFullYear()} Dupoin. All rights reserved.
      </footer>
    </div>
  );
}
