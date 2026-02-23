"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export interface FieldDefinition {
  name: string;
  label: string;
  type: "text" | "select" | "date" | "number" | "textarea";
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fields: FieldDefinition[];
  initialData?: Record<string, string>;
  onSubmit: (data: Record<string, string>) => Promise<void>;
  submitLabel?: string;
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  fields,
  initialData,
  onSubmit,
  submitLabel = "Save",
}: FormDialogProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const initial: Record<string, string> = {};
      fields.forEach((f) => {
        initial[f.name] = initialData?.[f.name] || "";
      });
      setFormData(initial);
    }
  }, [open, fields, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (err) {
      console.error("Form submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-zinc-800 bg-zinc-900 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <div
                key={field.name}
                className={
                  field.type === "textarea" ? "sm:col-span-2" : undefined
                }
              >
                <Label className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-red-400">*</span>
                  )}
                </Label>
                <div className="mt-1.5">
                  {field.type === "text" || field.type === "date" || field.type === "number" ? (
                    <Input
                      type={field.type}
                      value={formData[field.name] || ""}
                      onChange={(e) => updateField(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                    />
                  ) : field.type === "textarea" ? (
                    <Textarea
                      value={formData[field.name] || ""}
                      onChange={(e) => updateField(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      rows={3}
                      className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                    />
                  ) : field.type === "select" ? (
                    <Select
                      value={formData[field.name] || ""}
                      onValueChange={(v) => updateField(field.name, v)}
                    >
                      <SelectTrigger className="border-white/10 bg-white/5 text-zinc-300">
                        <SelectValue
                          placeholder={field.placeholder || "Select..."}
                        />
                      </SelectTrigger>
                      <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-200">
                        {field.options?.map((opt) => (
                          <SelectItem
                            key={opt}
                            value={opt}
                            className="text-zinc-200 focus:bg-zinc-800 focus:text-white"
                          >
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-zinc-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
