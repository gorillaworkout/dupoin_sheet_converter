"use client";

import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { FileUpload } from "@/components/sheets/file-upload";
import { SheetEditor } from "@/components/sheets/sheet-editor";
import type { ParsedFile } from "@/types/sheets";

function DashboardContent() {
  const [editorData, setEditorData] = useState<ParsedFile | null>(null);

  function handleFileParsed(data: ParsedFile) {
    setEditorData(data);
  }

  function handleBackFromEditor() {
    setEditorData(null);
  }

  if (editorData) {
    return (
      <SheetEditor parsedFile={editorData} onBack={handleBackFromEditor} />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Upload spreadsheet file, edit data, then save
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto max-w-2xl space-y-4"
      >
        <div>
          <h2 className="text-lg font-semibold text-white">
            Upload Spreadsheet
          </h2>
          <p className="text-sm text-zinc-500">
            Upload .xlsx, .xls, or .csv files to start editing
          </p>
        </div>
        <FileUpload onFileParsed={handleFileParsed} />
      </motion.div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
