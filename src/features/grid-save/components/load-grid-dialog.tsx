"use client";

import { useState } from "react";
import { FolderIcon, TrashIcon } from "@/components/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog/dialog";
import { addToast } from "@/components/ui/toast";
import { useGridSaveStore } from "../stores/grid-save-store";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type LoadGridDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function LoadGridDialog({ open: controlledOpen, onOpenChange }: LoadGridDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen;

  const presets = useGridSaveStore((s) => s.presets);
  const loadPreset = useGridSaveStore((s) => s.loadPreset);
  const deletePreset = useGridSaveStore((s) => s.deletePreset);
  const handleLoad = (id: string) => {
    const preset = presets.find((p) => p.id === id);
    loadPreset(id);
    if (preset) addToast(`「${preset.name}」を復元しました`);
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    const preset = presets.find((p) => p.id === id);
    deletePreset(id);
    if (preset) addToast(`「${preset.name}」を削除しました`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-foreground/10 hover:text-foreground md:h-7 md:w-7"
            aria-label="読み込み"
            title="読み込み"
          >
            <FolderIcon className="h-4 w-4 md:h-3.5 md:w-3.5" />
          </button>
        </DialogTrigger>
      )}
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>保存したコード進行</DialogTitle>
          <DialogDescription>
            データはこのデバイスのブラウザに保存されます。別のデバイスやブラウザからはアクセスできません。
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {presets.length === 0 ? (
            <p className="py-6 text-center text-muted text-sm">保存されたコード進行はありません</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {presets.map((preset) => (
                <li
                  key={preset.id}
                  className="flex items-center justify-between rounded-lg border border-foreground/10 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-sm">{preset.name}</p>
                    <p className="text-muted text-xs">{formatDate(preset.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      className="rounded-full px-3 py-1 text-foreground text-sm transition-colors hover:bg-foreground/10"
                      onClick={() => handleLoad(preset.id)}
                    >
                      復元
                    </button>
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDelete(preset.id)}
                      aria-label={`${preset.name} を削除`}
                      title="削除"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
