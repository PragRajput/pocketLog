import { ReactNode } from "react";

interface HeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function Header({ title, description, action }: HeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">{title}</h1>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
    </div>
  );
}
