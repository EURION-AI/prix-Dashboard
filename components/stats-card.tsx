"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: number | string;
  change?: number;
  unit?: string;
  className?: string;
}

export function StatsCard({
  label,
  value,
  change,
  unit = "",
  className = "",
}: StatsCardProps) {
  const isPositive = change && change > 0;

  return (
    <motion.div
      className={`p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/20 hover:bg-white/10 transition-all ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            {label}
          </h3>
          {change !== undefined && (
            <motion.div
              className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg ${
                isPositive
                  ? "text-green-400 bg-green-400/10"
                  : "text-red-400 bg-red-400/10"
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {isPositive ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {Math.abs(change).toFixed(1)}%
            </motion.div>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <motion.span
            className="text-4xl font-bold text-white"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {typeof value === "number" ? value.toLocaleString() : value}
          </motion.span>
          {unit && (
            <span className="text-lg text-gray-400 font-medium">{unit}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
