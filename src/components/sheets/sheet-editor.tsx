"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import {
  Save,
  Loader2,
  ArrowLeft,
  Plus,
  Trash2,
  RotateCcw,
  Download,
  ChevronDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import type { ParsedFile, ParsedSheet } from "@/types/sheets";

interface SheetEditorProps {
  parsedFile: ParsedFile;
  onBack: () => void;
}

export function SheetEditor({ parsedFile, onBack }: SheetEditorProps) {
  const [title, setTitle] = useState("");
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [currentSheetName, setCurrentSheetName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [originalHeaders, setOriginalHeaders] = useState<string[]>([]);
  const [originalRows, setOriginalRows] = useState<string[][]>([]);
  const [allSheets, setAllSheets] = useState<ParsedSheet[]>([]);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeCell, setActiveCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFromParsed = useCallback(
    (sheetIndex: number) => {
      const sheet = parsedFile.sheets[sheetIndex];
      if (!sheet) return;

      setCurrentSheetIndex(sheetIndex);
      setCurrentSheetName(sheet.name);
      setHeaders([...sheet.headers]);
      setRows(sheet.rows.map((r) => [...r]));
      setOriginalHeaders([...sheet.headers]);
      setOriginalRows(sheet.rows.map((r) => [...r]));
      setHasChanges(false);
    },
    [parsedFile]
  );

  useEffect(() => {
    setTitle(parsedFile.fileName.replace(/\.(xlsx|xls|csv)$/i, ""));
    setAvailableSheets(parsedFile.sheets.map((s) => s.name));
    setAllSheets(parsedFile.sheets);
    loadFromParsed(0);
  }, [parsedFile, loadFromParsed]);

  useEffect(() => {
    if (activeCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeCell]);

  function getCurrentSheets(): ParsedSheet[] {
    const updatedAllSheets = [...allSheets];
    updatedAllSheets[currentSheetIndex] = {
      name: currentSheetName,
      headers: [...headers],
      rows: rows.map((r) => [...r]),
    };
    return updatedAllSheets;
  }

  function switchSheet(index: number) {
    const updatedAllSheets = getCurrentSheets();
    setAllSheets(updatedAllSheets);

    const sheet = updatedAllSheets[index];
    setCurrentSheetIndex(index);
    setCurrentSheetName(sheet.name);
    setHeaders([...sheet.headers]);
    setRows(sheet.rows.map((r) => [...r]));
  }

  function updateCell(rowIndex: number, colIndex: number, value: string) {
    const updated = rows.map((r) => [...r]);
    updated[rowIndex][colIndex] = value;
    setRows(updated);
    setHasChanges(true);
  }

  function updateHeader(colIndex: number, value: string) {
    const updated = [...headers];
    updated[colIndex] = value;
    setHeaders(updated);
    setHasChanges(true);
  }

  function addRow() {
    const newRow = new Array(headers.length).fill("");
    setRows([...rows, newRow]);
    setHasChanges(true);
  }

  function addColumn() {
    setHeaders([...headers, `Kolom ${headers.length + 1}`]);
    setRows(rows.map((r) => [...r, ""]));
    setHasChanges(true);
  }

  function removeRow(index: number) {
    setRows(rows.filter((_, i) => i !== index));
    setHasChanges(true);
  }

  function removeColumn(index: number) {
    if (headers.length <= 1) return;
    setHeaders(headers.filter((_, i) => i !== index));
    setRows(rows.map((r) => r.filter((_, i) => i !== index)));
    setHasChanges(true);
  }

  function resetChanges() {
    setHeaders([...originalHeaders]);
    setRows(originalRows.map((r) => [...r]));
    setHasChanges(false);
    toast.info("Perubahan direset");
  }

  function buildWorkbook(sheets: ParsedSheet[]): XLSX.WorkBook {
    const workbook = XLSX.utils.book_new();
    for (const sheet of sheets) {
      const data = [sheet.headers, ...sheet.rows];
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
    }
    return workbook;
  }

  async function saveToFile() {
    setSaving(true);
    try {
      const sheetsToSave = getCurrentSheets();
      const ext = parsedFile.fileName
        .substring(parsedFile.fileName.lastIndexOf("."))
        .toLowerCase();

      if (parsedFile.fileHandle) {
        const writable = await parsedFile.fileHandle.createWritable();
        const workbook = buildWorkbook(sheetsToSave);

        if (ext === ".csv") {
          const csvContent = XLSX.utils.sheet_to_csv(
            workbook.Sheets[workbook.SheetNames[0]]
          );
          await writable.write(csvContent);
        } else {
          const buffer = XLSX.write(workbook, {
            type: "array",
            bookType: "xlsx",
          });
          await writable.write(new Uint8Array(buffer));
        }

        await writable.close();
        toast.success("File berhasil disimpan!");
      } else {
        const workbook = buildWorkbook(sheetsToSave);
        let blob: Blob;

        if (ext === ".csv") {
          const csvContent = XLSX.utils.sheet_to_csv(
            workbook.Sheets[workbook.SheetNames[0]]
          );
          blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        } else {
          const buffer = XLSX.write(workbook, {
            type: "array",
            bookType: "xlsx",
          });
          blob = new Blob([new Uint8Array(buffer)], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = parsedFile.fileName;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("File berhasil diunduh!");
      }

      setOriginalHeaders([...headers]);
      setOriginalRows(rows.map((r) => [...r]));
      setAllSheets(sheetsToSave);
      setHasChanges(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menyimpan file";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(
    e: React.KeyboardEvent,
    rowIndex: number,
    colIndex: number
  ) {
    if (e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      if (e.key === "Tab") {
        const nextCol = e.shiftKey ? colIndex - 1 : colIndex + 1;
        if (nextCol >= 0 && nextCol < headers.length) {
          setActiveCell({ row: rowIndex, col: nextCol });
        } else if (!e.shiftKey && rowIndex < rows.length - 1) {
          setActiveCell({ row: rowIndex + 1, col: 0 });
        }
      } else {
        const nextRow = e.shiftKey ? rowIndex - 1 : rowIndex + 1;
        if (nextRow >= 0 && nextRow < rows.length) {
          setActiveCell({ row: nextRow, col: colIndex });
        }
      }
    }
    if (e.key === "Escape") {
      setActiveCell(null);
    }
  }

  function exportCsv() {
    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title || "export"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("File CSV berhasil diunduh");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-9 w-9 text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>{rows.length} baris</span>
              <span>&middot;</span>
              <span>{headers.length} kolom</span>
              {hasChanges ? (
                <Badge className="ml-1 border-amber-500/30 bg-amber-500/10 text-amber-400">
                  Belum disimpan
                </Badge>
              ) : (
                <Badge className="ml-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  <Check className="mr-1 h-3 w-3" />
                  Tersimpan
                </Badge>
              )}
              {!parsedFile.fileHandle && (
                <Badge className="ml-1 border-zinc-500/30 bg-zinc-500/10 text-zinc-400">
                  Download mode
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {availableSheets.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-white/10 bg-white/5 text-zinc-300"
                >
                  {currentSheetName}
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-zinc-800 bg-zinc-900">
                {availableSheets.map((name, i) => (
                  <DropdownMenuItem
                    key={name}
                    onClick={() => switchSheet(i)}
                    className="text-zinc-300 focus:bg-zinc-800 focus:text-white"
                  >
                    {name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={exportCsv}
            className="gap-1.5 text-zinc-400 hover:text-white"
          >
            <Download className="h-3.5 w-3.5" />
            CSV
          </Button>

          {hasChanges && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetChanges}
              className="gap-1.5 text-zinc-400 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}

          <Button
            size="sm"
            onClick={saveToFile}
            disabled={saving || !hasChanges}
            className="gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {hasChanges ? "Simpan" : "Tersimpan"}
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-white/5 bg-white/[0.02] backdrop-blur-sm">
        <CardHeader className="border-b border-white/5 p-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={addColumn}
              className="h-7 gap-1 text-xs text-zinc-400 hover:text-cyan-400"
            >
              <Plus className="h-3 w-3" />
              Kolom
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={addRow}
              className="h-7 gap-1 text-xs text-zinc-400 hover:text-cyan-400"
            >
              <Plus className="h-3 w-3" />
              Baris
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[60vh]">
            <div className="min-w-full overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.03]">
                    <th className="w-10 border-r border-white/5 px-2 py-2 text-center text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                      #
                    </th>
                    {headers.map((header, colIndex) => (
                      <th
                        key={colIndex}
                        className="group relative min-w-[140px] border-r border-white/5 p-0"
                      >
                        <Input
                          value={header}
                          onChange={(e) =>
                            updateHeader(colIndex, e.target.value)
                          }
                          className="h-9 rounded-none border-0 bg-transparent text-xs font-semibold uppercase tracking-wider text-cyan-400 placeholder:text-zinc-600 focus:bg-white/[0.02] focus-visible:ring-0 focus-visible:ring-offset-0"
                          placeholder={`Kolom ${colIndex + 1}`}
                        />
                        <button
                          onClick={() => removeColumn(colIndex)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-600 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="group border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="relative border-r border-white/5 px-2 py-0 text-center text-[10px] text-zinc-600">
                        {rowIndex + 1}
                        <button
                          onClick={() => removeRow(rowIndex)}
                          className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 text-red-400 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </td>
                      {row.map((cell, colIndex) => {
                        const isActive =
                          activeCell?.row === rowIndex &&
                          activeCell?.col === colIndex;
                        return (
                          <td
                            key={colIndex}
                            className={`border-r border-white/[0.03] p-0 ${
                              isActive
                                ? "ring-1 ring-inset ring-cyan-500/50"
                                : ""
                            }`}
                            onClick={() =>
                              setActiveCell({
                                row: rowIndex,
                                col: colIndex,
                              })
                            }
                          >
                            <Input
                              ref={isActive ? inputRef : undefined}
                              value={cell}
                              onChange={(e) =>
                                updateCell(
                                  rowIndex,
                                  colIndex,
                                  e.target.value
                                )
                              }
                              onKeyDown={(e) =>
                                handleKeyDown(e, rowIndex, colIndex)
                              }
                              onFocus={() =>
                                setActiveCell({
                                  row: rowIndex,
                                  col: colIndex,
                                })
                              }
                              className="h-8 rounded-none border-0 bg-transparent text-sm text-zinc-300 placeholder:text-zinc-700 focus:bg-white/[0.02] focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}
