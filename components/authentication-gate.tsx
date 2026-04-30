"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

interface AuthenticationGateProps {
  children: React.ReactNode;
  requiredPassword: string;
}

export function AuthenticationGate({
  children,
  requiredPassword,
}: AuthenticationGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Cleanup legacy localStorage session if it exists
    localStorage.removeItem("dashboard-auth");
    
    const stored = sessionStorage.getItem("dashboard-auth");
    if (stored === requiredPassword) {
      setIsAuthenticated(true);
    }
  }, [requiredPassword]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === requiredPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem("dashboard-auth", requiredPassword);
      setError(false);
    } else {
      setError(true);
      setInput("");
    }
  };

  if (!mounted) return null;

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 space-y-8">
          <div className="flex flex-col items-center gap-4">
            <motion.div
              className="p-4 rounded-full bg-blue-500/10 border border-blue-500/20"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Lock className="w-6 h-6 text-blue-400" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white text-center">
              Dashboard Access
            </h1>
            <p className="text-gray-400 text-center text-sm">
              Enter the password to access the dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <input
                type="password"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setError(false);
                }}
                placeholder="Enter password"
                className={`w-full px-4 py-3 rounded-lg bg-white/5 border transition-all outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  error
                    ? "border-red-500/50 focus:ring-red-500"
                    : "border-white/10 hover:border-white/20"
                } text-white placeholder:text-gray-500`}
                autoFocus
              />
              {error && (
                <motion.p
                  className="text-red-400 text-sm font-medium"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Incorrect password. Try again.
                </motion.p>
              )}
            </div>
            <motion.button
              type="submit"
              className="w-full px-4 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Unlock Dashboard
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
