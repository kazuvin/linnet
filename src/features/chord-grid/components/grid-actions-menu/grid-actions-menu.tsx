"use client";

import { useState } from "react";
import { EllipsisVerticalIcon, FolderIcon, SaveIcon, ShareIcon } from "@/components/icons";
import { IconButton } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu/dropdown-menu";
import { LoadGridDialog } from "@/features/grid-save/components/load-grid-dialog";
import { SaveGridDialog } from "@/features/grid-save/components/save-grid-dialog";
import { useShareGrid } from "@/features/grid-share/hooks/use-share-grid";

export function GridActionsMenu() {
  const [saveOpen, setSaveOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const shareGrid = useShareGrid();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton aria-label="メニュー" title="メニュー">
            <EllipsisVerticalIcon className="h-4 w-4" />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onSelect={() => setSaveOpen(true)}>
            <SaveIcon className="mr-2 h-4 w-4" />
            保存
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setLoadOpen(true)}>
            <FolderIcon className="mr-2 h-4 w-4" />
            開く
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={shareGrid}>
            <ShareIcon className="mr-2 h-4 w-4" />
            共有
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SaveGridDialog open={saveOpen} onOpenChange={setSaveOpen} />
      <LoadGridDialog open={loadOpen} onOpenChange={setLoadOpen} />
    </>
  );
}
