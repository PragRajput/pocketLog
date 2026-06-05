"use client";

import { UpiPayDialog } from "./upi-pay-dialog";
import { Button } from "@/components/ui/button";
import { ScanLine } from "lucide-react";

interface Category { id: string; name: string }
interface TagType { id: string; name: string; color: string }
interface RecentPayee { vpa: string; name: string | null }

interface Props {
  categories: Category[];
  tags: TagType[];
  recentPayees: RecentPayee[];
}

// Mobile-only floating action button for Scan & Pay. Sits above the bottom
// tab bar, within thumb reach. Hidden on desktop (the header button is used).
export function ScanPayFab(props: Props) {
  return (
    <div className="md:hidden fixed right-4 z-30 bottom-[calc(4.75rem+env(safe-area-inset-bottom))]">
      <UpiPayDialog
        {...props}
        trigger={
          <Button className="h-12 rounded-full px-5 gap-2 shadow-lg shadow-indigo-600/30">
            <ScanLine size={18} />
            Pay
          </Button>
        }
      />
    </div>
  );
}
