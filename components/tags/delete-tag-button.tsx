"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteTag } from "@/lib/actions";
import { toast } from "@/lib/toast";
import { Trash2 } from "lucide-react";

export function DeleteTagButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await deleteTag(id);
      setOpen(false);
      toast({ title: "Tag deleted", variant: "info" });
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => setOpen(true)}
      >
        <Trash2 size={14} />
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete tag?"
        description="Expenses will keep their data but will no longer be linked to this tag. This action cannot be undone."
        confirmLabel="Delete Tag"
        onConfirm={handleConfirm}
        isPending={isPending}
      />
    </>
  );
}
