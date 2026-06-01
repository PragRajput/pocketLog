"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

interface Props {
  name?: string | null;
  email?: string | null;
}

export function UserMenu({ name, email }: Props) {
  const initials = (name ?? email ?? "U")
    .split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 group">
      <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold flex-shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-800 truncate">{name ?? email}</p>
        {name && <p className="text-[10px] text-gray-400 truncate">{email}</p>}
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
        title="Sign out"
      >
        <LogOut size={14} />
      </button>
    </div>
  );
}
