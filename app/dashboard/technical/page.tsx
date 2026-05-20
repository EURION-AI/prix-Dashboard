"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Database, Cpu, GitPullRequest } from "lucide-react";
import { TimeRangeFilter } from "@/components/time-range-filter";
import { MetricCard } from "@/components/metric-card";
import { KPIGrid } from "@/components/kpi-grid";
import { ChartContainer } from "@/components/chart-container";
import { fetchDashboardData, DashboardPerformance, TimeRange } from "@/lib/api-config";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function TechnicalPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24H");
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<DashboardPerformance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const d = await fetchDashboardData<DashboardPerformance>("technical", timeRange);
        setData(d);
      } catch (error) {
        console.error("Failed to load performance data:", error);
      } finally {
        setLoading(false);
      }
    }
    if (mounted) loadData();
  }, [timeRange, mounted]);

  if (!mounted) return null;
  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const { executionStats } = data;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="flex items-center justify-between" variants={itemVariants}>
        <div>
          <h1 className="text-3xl font-bold text-white">Technical Performance</h1>
          <p className="text-slate-400 mt-1">Issue plan execution and PR activity metrics</p>
        </div>
        <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <KPIGrid>
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <p className="text-sm text-slate-400 mb-2">Avg Execution Duration</p>
            <p className="text-3xl font-bold text-white">{executionStats.avg_duration.toFixed(0)}ms</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <p className="text-sm text-slate-400 mb-2">Min Duration</p>
            <p className="text-3xl font-bold text-white">{executionStats.min_duration.toFixed(0)}ms</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <p className="text-sm text-slate-400 mb-2">Max Duration</p>
            <p className="text-3xl font-bold text-white">{executionStats.max_duration.toFixed(0)}ms</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <p className="text-sm text-slate-400 mb-2">Total Executions</p>
            <p className="text-3xl font-bold text-white">{executionStats.total_executions.toLocaleString()}</p>
          </div>
        </KPIGrid>
      </motion.div>

      <motion.div variants={itemVariants}>
        <KPIGrid>
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <p className="text-sm text-slate-400 mb-2">Avg Files Retrieved</p>
            <p className="text-3xl font-bold text-white">{executionStats.avg_files.toFixed(1)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <p className="text-sm text-slate-400 mb-2">Avg Token Estimate</p>
            <p className="text-3xl font-bold text-white">{executionStats.avg_tokens.toFixed(0)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <p className="text-sm text-slate-400 mb-2">PR Activity (30d)</p>
            <p className="text-3xl font-bold text-white">{data.activityTimeline.length} days</p>
          </div>
        </KPIGrid>
      </motion.div>

      <motion.div variants={itemVariants}>
        <ChartContainer title="PR Activity Timeline" description="PR reviews over the last 30 days">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.activityTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </motion.div>
    </motion.div>
  );
}
