"use client";

import { motion } from "framer-motion";
import type { TimeRange } from "@/lib/mock-data";

interface TimeRangeFilterProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

const RANGES: TimeRange[] = ["24H", "7D", "1M", "3M", "ALL"];

export function TimeRangeFilter({
  value,
  onChange,
}: TimeRangeFilterProps) {
  return (
    <div className="flex gap-2">
      {RANGES.map((range) => (
        <motion.button
          key={range}
          onClick={() => onChange(range)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            value === range
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/50"
              : "bg-white/5 text-gray-400 border border-white/10 hover:border-white/20"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {range}
        </motion.button>
      ))}
    </div>
  );
}
