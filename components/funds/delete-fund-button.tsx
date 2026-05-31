"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteFund } from "@/lib/actions";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function DeleteFundButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleConfirm() {
    startTransition(async () => {
      await deleteFund(id);
      setOpen(false);
      router.push("/funds");
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-gray-400 hover:text-red-500"
        onClick={() => setOpen(true)}
      >
        <Trash2 size={14} />
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete fund?"
        description="This will permanently delete this fund and all its expenses. This action cannot be undone."
        confirmLabel="Delete Fund"
        onConfirm={handleConfirm}
        isPending={isPending}
      />
    </>
  );
}
