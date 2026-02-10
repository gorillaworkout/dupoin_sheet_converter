"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileSpreadsheet,
  Loader2,
  X,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import type { ParsedFile, ParsedSheet } from "@/types/sheets";

interface FileUploadProps {
  onFileParsed: (data: ParsedFile) => void;
}

function parseWorkbook(workbook: XLSX.WorkBook): ParsedSheet[] {
  return workbook.SheetNames.map((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: string[][] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
      raw: false,
    });

    if (jsonData.length === 0) {
      return { name: sheetName, headers: [], rows: [] };
    }

    const headers = jsonData[0].map((h) => String(h));
    const rows = jsonData.slice(1).map((row) => {
      const normalized = row.map((cell) => String(cell));
      while (normalized.length < headers.length) {
        normalized.push("");
      }
      return normalized.slice(0, headers.length);
    });

    return { name: sheetName, headers, rows };
  });
}

export function FileUpload({ onFileParsed }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const processFile = useCallback(
    async (file: File, fileHandle: FileSystemFileHandle | null) => {
      setUploading(true);
      setFileName(file.name);

      try {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheets = parseWorkbook(workbook);

        const result: ParsedFile = {
          fileName: file.name,
          fileHandle,
          sheets,
        };

        toast.success(`File "${file.name}" berhasil diproses`);
        onFileParsed(result);
      } catch {
        toast.error("Gagal memproses file");
        setFileName(null);
      } finally {
        setUploading(false);
      }
    },
    [onFileParsed]
  );

  const openFilePicker = useCallback(async () => {
    if ("showOpenFilePicker" in window) {
      try {
        const picker = window.showOpenFilePicker as unknown as (
          options: { types: { description: string; accept: Record<string, string[]> }[]; multiple: boolean }
        ) => Promise<FileSystemFileHandle[]>;
        const [handle] = await picker({
          types: [
            {
              description: "Spreadsheet",
              accept: {
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
                "application/vnd.ms-excel": [".xls"],
                "text/csv": [".csv"],
              },
            },
          ],
          multiple: false,
        });
        const file = await handle.getFile();
        await processFile(file, handle);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          toast.error("Gagal membuka file");
        }
      }
    } else {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".xlsx,.xls,.csv";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (file) await processFile(file, null);
      };
      input.click();
    }
  }, [processFile]);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      const items = e.dataTransfer.items;
      if (items?.[0]?.kind === "file") {
        let fileHandle: FileSystemFileHandle | null = null;

        if ("getAsFileSystemHandle" in items[0]) {
          try {
            const handle = await (items[0] as DataTransferItem & {
              getAsFileSystemHandle(): Promise<FileSystemHandle>;
            }).getAsFileSystemHandle();
            if (handle.kind === "file") {
              fileHandle = handle as FileSystemFileHandle;
            }
          } catch { /* intentional: unsupported browser fallback */ }
        }

        const file = fileHandle
          ? await fileHandle.getFile()
          : e.dataTransfer.files[0];

        if (file) {
          const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
          if ([".xlsx", ".xls", ".csv"].includes(ext)) {
            await processFile(file, fileHandle);
          } else {
            toast.error("Format file harus .xlsx, .xls, atau .csv");
          }
        }
      }
    },
    [processFile]
  );

  function clearFile() {
    setFileName(null);
  }

  return (
    <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <Loader2 className="mb-4 h-10 w-10 animate-spin text-cyan-500" />
              <p className="text-sm font-medium text-white">
                Memproses file...
              </p>
              <p className="mt-1 text-xs text-zinc-500">{fileName}</p>
            </motion.div>
          ) : fileName ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <CheckCircle2 className="mb-4 h-10 w-10 text-emerald-500" />
              <p className="text-sm font-medium text-white">File berhasil diproses</p>
              <p className="mt-1 text-xs text-zinc-500">{fileName}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFile}
                className="mt-3 gap-1 text-xs text-zinc-400 hover:text-white"
              >
                <X className="h-3 w-3" />
                Upload file lain
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragOver(false);
              }}
              onClick={openFilePicker}
              className={`group cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
                dragOver
                  ? "border-cyan-500/50 bg-cyan-500/5"
                  : "border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.02]"
              }`}
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 transition-colors group-hover:from-cyan-500/20 group-hover:to-blue-500/20">
                {dragOver ? (
                  <FileSpreadsheet className="h-7 w-7 text-cyan-400" />
                ) : (
                  <Upload className="h-7 w-7 text-zinc-500 transition-colors group-hover:text-cyan-400" />
                )}
              </div>

              <p className="text-sm font-medium text-white">
                {dragOver ? "Lepas file di sini" : "Drag & drop file spreadsheet"}
              </p>
              <p className="mt-1.5 text-xs text-zinc-500">
                atau klik untuk memilih file
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                {[".xlsx", ".xls", ".csv"].map((ext) => (
                  <span
                    key={ext}
                    className="rounded-md border border-white/5 bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium text-zinc-400"
                  >
                    {ext}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
