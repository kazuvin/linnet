"use client";

import { type FormEvent, useState } from "react";
import { SaveIcon } from "@/components/icons";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog/dialog";
import { Input } from "@/components/ui/input/input";
import { addToast } from "@/components/ui/toast";
import { useGridSaveStore } from "../stores/grid-save-store";

type SaveGridDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function SaveGridDialog({ open: controlledOpen, onOpenChange }: SaveGridDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen;

  const [name, setName] = useState("");
  const saveCurrentGrid = useGridSaveStore((s) => s.saveCurrentGrid);
  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    saveCurrentGrid(trimmed);
    addToast(`「${trimmed}」を保存しました`);
    setName("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-foreground/10 hover:text-foreground md:h-7 md:w-7"
            aria-label="保存"
            title="保存"
          >
            <SaveIcon className="h-4 w-4 md:h-3.5 md:w-3.5" />
          </button>
        </DialogTrigger>
      )}
      <DialogContent size="sm">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>コード進行を保存</DialogTitle>
            <DialogDescription>
              データはこのデバイスのブラウザに保存されます。別のデバイスやブラウザからはアクセスできません。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="text"
              placeholder="プリセット名を入力"
              value={name}
              onChange={(e) => setName(e.target.value)}
              size="sm"
              autoFocus
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <button
                type="button"
                className="rounded-full px-4 py-2 text-muted text-sm transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                キャンセル
              </button>
            </DialogClose>
            <button
              type="submit"
              disabled={!name.trim()}
              className="rounded-full bg-foreground px-4 py-2 text-background text-sm transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              保存
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
