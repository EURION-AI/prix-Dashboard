"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { PachinkoNumber } from "./pachinko-number";

interface PachinkoCounterProps {
  value: number;
  label?: string;
  suffix?: string;
  className?: string;
}

export function PachinkoCounter({
  value,
  label,
  suffix = "",
  className = "",
}: PachinkoCounterProps) {
  // Format the value with comma separators
  const formattedValue = useMemo(() => {
    return value.toLocaleString("en-US");
  }, [value]);

  // Split into parts for display
  const parts = formattedValue.split("");

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {label && (
        <motion.p
          className="text-sm font-medium text-gray-400 uppercase tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {label}
        </motion.p>
      )}
      <div className="flex items-baseline gap-1">
        <div className="inline-flex">
          {parts.map((char, index) => (
            <motion.span
              key={`${index}-${char}`}
              className="inline-flex items-center justify-center font-mono font-bold text-5xl text-blue-400 tabular-nums h-16"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.6,
                type: "spring",
                stiffness: 100,
                damping: 15,
                delay: index * 0.02,
              }}
            >
              {char}
            </motion.span>
          ))}
        </div>
        {suffix && (
          <motion.span
            className="text-3xl font-bold text-blue-400 ml-1"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: parts.length * 0.02 + 0.1 }}
          >
            {suffix}
          </motion.span>
        )}
      </div>
    </div>
  );
}
