"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface LeaderboardItem {
  [key: string]: string | number;
}

interface Column {
  key: string;
  label: string;
  format?: (value: unknown) => string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
}

interface LeaderboardProps {
  items: LeaderboardItem[];
  columns: Column[];
  className?: string;
}

export function Leaderboard({
  items,
  columns,
  className = "",
}: LeaderboardProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    if (!sortKey) return 0;

    const aVal = a[sortKey];
    const bVal = b[sortKey];

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    }

    const aStr = String(aVal);
    const bStr = String(bVal);
    return sortDirection === "asc"
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-sm font-semibold text-slate-400 text-${
                  col.align || "left"
                } ${col.sortable ? "cursor-pointer hover:text-slate-200" : ""}`}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div className="flex items-center gap-2 justify-between">
                  <span>{col.label}</span>
                  {col.sortable && sortKey === col.key && (
                    <span>
                      {sortDirection === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedItems.map((item, idx) => (
            <tr
              key={idx}
              className="border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              {columns.map((col) => (
                <td
                  key={`${idx}-${col.key}`}
                  className={`px-4 py-3 text-sm text-white text-${
                    col.align || "left"
                  }`}
                >
                  {col.format ? col.format(item[col.key]) : String(item[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Leaderboard;
