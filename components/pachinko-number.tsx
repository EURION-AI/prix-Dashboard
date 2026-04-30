"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface PachinkoNumberProps {
  value: number;
  duration?: number;
}

export function PachinkoNumber({
  value,
  duration = 0.6,
}: PachinkoNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const digits = String(displayValue).padStart(1, "0").split("");

  return (
    <div className="inline-flex items-baseline gap-0">
      {digits.map((digit, index) => (
        <motion.div
          key={`${index}-${digit}`}
          className="inline-flex items-center justify-center w-8 h-10 text-4xl font-bold text-blue-400 tabular-nums"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration,
            type: "spring",
            stiffness: 100,
            damping: 15,
            delay: index * 0.05,
          }}
        >
          {digit}
        </motion.div>
      ))}
    </div>
  );
}
