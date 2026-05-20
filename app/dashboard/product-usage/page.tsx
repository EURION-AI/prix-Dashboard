"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, FileCode, GitPullRequest, Bug, Cpu, Clock, Database, Zap } from "lucide-react";
import { TimeRangeFilter } from "@/components/time-range-filter";
import { MetricCard } from "@/components/metric-card";
import { KPIGrid } from "@/components/kpi-grid";
import { ChartContainer } from "@/components/chart-container";
import { fetchDashboardData, DashboardProductUsage, TimeRange } from "@/lib/api-config";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ProductUsagePage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24H");
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<DashboardProductUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const d = await fetchDashboardData<DashboardProductUsage>("product-usage", timeRange);
        setData(d);
      } catch (error) {
        console.error("Failed to load product usage:", error);
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const { monthlyUsage, totalUsage, executionStats } = data;

  return (
    <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="flex items-end justify-between gap-4" variants={itemVariants}>
        <div>
          <h1 className="text-3xl font-bold text-white">Product Usage</h1>
          <p className="text-slate-400 mt-1">User consumption and execution metrics</p>
        </div>
        <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
      </motion.div>

      {/* Monthly Usage */}
      <motion.div variants={itemVariants}>
        <KPIGrid>
          <MetricCard label="Monthly PRs Reviewed" value={monthlyUsage.prs_reviewed.toLocaleString()} icon={<GitPullRequest className="w-8 h-8" />} />
          <MetricCard label="Monthly Auto PRs" value={monthlyUsage.auto_prs.toLocaleString()} icon={<FileCode className="w-8 h-8" />} />
          <MetricCard label="Monthly Issues Planned" value={monthlyUsage.issues_planned.toLocaleString()} icon={<Bug className="w-8 h-8" />} />
          <MetricCard label="Monthly Grand Total" value={monthlyUsage.grand_total.toLocaleString()} icon={<Zap className="w-8 h-8" />} />
        </KPIGrid>
      </motion.div>

      {/* Total Usage */}
      <motion.div variants={itemVariants}>
        <KPIGrid>
          <MetricCard label="Total PRs Reviewed" value={totalUsage.prs_reviewed.toLocaleString()} icon={<GitPullRequest className="w-8 h-8" />} />
          <MetricCard label="Total Auto PRs" value={totalUsage.auto_prs.toLocaleString()} icon={<FileCode className="w-8 h-8" />} />
          <MetricCard label="Total Issues Planned" value={totalUsage.issues_planned.toLocaleString()} icon={<Bug className="w-8 h-8" />} />
          <MetricCard label="Total Executions" value={executionStats.total_executions.toLocaleString()} icon={<Cpu className="w-8 h-8" />} />
        </KPIGrid>
      </motion.div>

      {/* Execution Stats */}
      <motion.div variants={itemVariants}>
        <KPIGrid>
          <MetricCard label="Avg Execution Duration" value={`${executionStats.avg_duration.toFixed(0)}ms`} icon={<Clock className="w-8 h-8" />} />
          <MetricCard label="Avg Files Retrieved" value={executionStats.avg_files.toFixed(1)} icon={<Database className="w-8 h-8" />} />
          <MetricCard label="Avg Token Estimate" value={executionStats.avg_tokens.toFixed(0)} icon={<Cpu className="w-8 h-8" />} />
        </KPIGrid>
      </motion.div>

      {/* Chart */}
      <motion.div variants={itemVariants}>
        <ChartContainer title="Usage Trends" description="Usage metrics over time">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </motion.div>
    </motion.div>
  );
}
